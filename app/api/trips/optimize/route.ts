import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { buildEligiblePairs, optimizeAssignments } from "@/lib/optimizer/batchOptimize";

export async function POST() {
  const guard = await withPermission("trip:dispatch");
  if (guard.response) return guard.response;

  const [trips, vehicles, drivers] = await Promise.all([
    prisma.trip.findMany({ where: { status: "DRAFT" }, orderBy: { createdAt: "asc" } }),
    prisma.vehicle.findMany({ where: { status: "AVAILABLE" } }),
    prisma.driver.findMany({ where: { status: "AVAILABLE" } }),
  ]);

  if (trips.length < 2) return NextResponse.json({ assignments: [], message: "Need at least 2 pending trips." });

  const pairs = buildEligiblePairs(vehicles, drivers);
  const assignments = optimizeAssignments(trips, pairs);
  return NextResponse.json({ assignments });
}
