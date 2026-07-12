import { DriverStatus, Prisma, TripStatus, VehicleStatus } from "@prisma/client";
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

    const updatedTrip = await tx.trip.update({ where: { id: trip.id }, data: { status: TripStatus.DISPATCHED } });
    await tx.vehicle.update({ where: { id: trip.vehicleId! }, data: { status: VehicleStatus.ON_TRIP } });
    await tx.driver.update({ where: { id: trip.driverId! }, data: { status: DriverStatus.ON_TRIP } });

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

    return updatedTrip;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function transitionTripStatus(tripId: string, nextStatus: TripStatus, actorUserId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new Error("Trip not found.");

    if (!canTransition(trip.status, nextStatus)) throw new Error(`Invalid transition from ${trip.status} to ${nextStatus}`);

    const updated = await tx.trip.update({ where: { id: tripId }, data: { status: nextStatus } });

    if ([TripStatus.COMPLETED, TripStatus.CANCELLED].includes(nextStatus) && trip.vehicleId && trip.driverId) {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.AVAILABLE } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.AVAILABLE } });
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
