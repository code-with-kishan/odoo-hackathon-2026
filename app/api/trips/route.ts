import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { dispatchTrip, transitionTripStatus } from "@/lib/trips/lifecycle";
import { TripStatus } from "@prisma/client";

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

  const trip = await prisma.trip.create({
    data: {
      source: body.source,
      destination: body.destination,
      cargoWeightKg: body.cargoWeightKg,
      plannedDistanceKm: body.plannedDistanceKm,
      vehicleId: body.vehicleId ?? null,
      driverId: body.driverId ?? null,
      createdById: guard.user!.id,
      status: body.status ?? TripStatus.DRAFT,
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
    const trip = await transitionTripStatus(body.tripId, body.status, guard.user!.id);
    return NextResponse.json(trip);
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
