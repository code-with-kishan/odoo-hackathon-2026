import { Prisma } from "@prisma/client";
import type { DriverStatus, TripStatus, VehicleStatus } from "@/lib/domain/enums";
import { prisma } from "@/lib/db/prisma";
import { validateTripAssignment } from "@/lib/validation/trip";
import { canTransition } from "@/lib/trips/rules";

export async function dispatchTrip(tripId: string, actorUserId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { vehicle: true, driver: true } });
    if (!trip) throw new Error("Trip not found.");
    if (!trip.vehicle || !trip.driver) throw new Error("Trip must have assigned vehicle and driver before dispatch.");

    const validation = validateTripAssignment({
      cargoWeightKg: trip.cargoWeightKg,
      vehicle: { id: trip.vehicle.id, status: trip.vehicle.status, maxLoadCapacityKg: trip.vehicle.maxLoadCapacityKg },
      driver: { id: trip.driver.id, status: trip.driver.status, licenseExpiryDate: trip.driver.licenseExpiryDate },
    });

    if (!validation.valid) throw new Error(validation.errors.join(" "));

    const updatedTrip = await tx.trip.update({ where: { id: trip.id }, data: { status: "DISPATCHED" } });
    const updatedVehicle = await tx.vehicle.update({ where: { id: trip.vehicleId! }, data: { status: "ON_TRIP" } });
    const updatedDriver = await tx.driver.update({ where: { id: trip.driverId! }, data: { status: "ON_TRIP" } });

    await tx.auditLog.create({
      data: {
        actorUserId,
        entity: "Trip",
        entityId: trip.id,
        action: "DISPATCH",
        beforeState: { status: trip.status },
        afterState: { status: updatedTrip.status },
      },
    });

    await tx.auditLog.createMany({
      data: [
        {
          actorUserId,
          entity: "Vehicle",
          entityId: updatedVehicle.id,
          action: "STATUS_ON_TRIP",
          beforeState: { status: trip.vehicle!.status },
          afterState: { status: updatedVehicle.status },
        },
        {
          actorUserId,
          entity: "Driver",
          entityId: updatedDriver.id,
          action: "STATUS_ON_TRIP",
          beforeState: { status: trip.driver!.status },
          afterState: { status: updatedDriver.status },
        },
      ],
    });

    return updatedTrip;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function transitionTripStatus(tripId: string, nextStatus: TripStatus, actorUserId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { vehicle: true, driver: true } });
    if (!trip) throw new Error("Trip not found.");

    if (!canTransition(trip.status, nextStatus)) throw new Error(`Invalid transition from ${trip.status} to ${nextStatus}`);

    const updated = await tx.trip.update({ where: { id: tripId }, data: { status: nextStatus } });

    if (["COMPLETED", "CANCELLED"].includes(nextStatus) && trip.vehicleId && trip.driverId) {
      const updatedVehicle = await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } });
      const updatedDriver = await tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });

      await tx.auditLog.createMany({
        data: [
          {
            actorUserId,
            entity: "Vehicle",
            entityId: updatedVehicle.id,
            action: "STATUS_AVAILABLE",
            beforeState: { status: trip.vehicle?.status },
            afterState: { status: updatedVehicle.status },
          },
          {
            actorUserId,
            entity: "Driver",
            entityId: updatedDriver.id,
            action: "STATUS_AVAILABLE",
            beforeState: { status: trip.driver?.status },
            afterState: { status: updatedDriver.status },
          },
        ],
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId,
        entity: "Trip",
        entityId: trip.id,
        action: `STATUS_${nextStatus}`,
        beforeState: { status: trip.status },
        afterState: { status: nextStatus },
      },
    });

    return updated;
  });
}
