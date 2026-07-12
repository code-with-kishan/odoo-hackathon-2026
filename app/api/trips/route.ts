import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { dispatchTrip, transitionTripStatus } from "@/lib/trips/lifecycle";
import { tripDraftSchema, validateTripAssignment } from "@/lib/validation/trip";

export async function GET() {
  const guard = await withPermission("trip:create");
  if (guard.response) return guard.response;
  const trips = await prisma.trip.findMany({ include: { vehicle: true, driver: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const guard = await withPermission("trip:create");
  if (guard.response) return guard.response;
  const body = await req.json();
  const parsed = tripDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  let vehicle = null;
  let driver = null;

  if (parsed.data.vehicleId) {
    vehicle = await prisma.vehicle.findUnique({ where: { id: parsed.data.vehicleId } });
  }

  if (parsed.data.driverId) {
    driver = await prisma.driver.findUnique({ where: { id: parsed.data.driverId } });
  }

  const validation = validateTripAssignment({
    cargoWeightKg: parsed.data.cargoWeightKg,
    vehicle: vehicle
      ? { id: vehicle.id, status: vehicle.status, maxLoadCapacityKg: vehicle.maxLoadCapacityKg }
      : null,
    driver: driver
      ? { id: driver.id, status: driver.status, licenseExpiryDate: driver.licenseExpiryDate }
      : null,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: "Validation failed", issues: validation.errors }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      source: parsed.data.source,
      destination: parsed.data.destination,
      cargoWeightKg: parsed.data.cargoWeightKg,
      plannedDistanceKm: parsed.data.plannedDistanceKm,
      vehicleId: parsed.data.vehicleId ?? null,
      driverId: parsed.data.driverId ?? null,
      createdById: guard.user!.id,
      status: body.status ?? "DRAFT",
    },
  });

  return NextResponse.json(trip, { status: 201 });
}

export async function PATCH(req: Request) {
  const guard = await withPermission("trip:dispatch");
  if (guard.response) return guard.response;
  const body = await req.json();

  if (body.action === "dispatch") {
    const trip = await dispatchTrip(body.tripId, guard.user!.id);
    return NextResponse.json(trip);
  }

  if (body.action === "transition") {
    const extra = body.status === "COMPLETED" ? {
      odometerKm: body.odometerKm !== undefined ? Number(body.odometerKm) : undefined,
      fuelLiters: body.fuelLiters !== undefined ? Number(body.fuelLiters) : undefined,
      fuelCost: body.fuelCost !== undefined ? Number(body.fuelCost) : undefined,
    } : undefined;

    try {
      const trip = await transitionTripStatus(body.tripId, body.status, guard.user!.id, extra);
      return NextResponse.json(trip);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
