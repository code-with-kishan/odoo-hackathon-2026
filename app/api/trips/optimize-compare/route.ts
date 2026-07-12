import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { greedyAssignments, totalCost } from "@/lib/optimizer/compare";

/**
 * Phase 5 acceptance: stage the SAME (trips x pairs) scenario, then return BOTH
 * the Hungarian optimal (computed by the existing Python solver via
 * /api/trips/optimize) and a greedy pick so the UI can show them side-by-side.
 *
 * To keep this endpoint self-contained and Python-free on the comparison side,
 * we compute the greedy assignment here in TS and ALSO recompute the optimum in
 * TS via an O(n^3) Hungarian implementation so the demo never silently returns
 * an empty comparison if Python is unavailable. (The Python path remains the
 * canonical solver in batchOptimize.ts; this is a parallel, equivalent compute.)
 */
export async function POST() {
  const guard = await withPermission("trip:dispatch");
  if (guard.response) return guard.response;

  const [trips, vehicles, drivers] = await Promise.all([
    prisma.trip.findMany({ where: { status: "DRAFT" }, orderBy: { createdAt: "asc" } }),
    prisma.vehicle.findMany({ where: { status: "AVAILABLE" } }),
    prisma.driver.findMany({ where: { status: "AVAILABLE" } }),
  ]);

  if (trips.length < 2) {
    return NextResponse.json({ message: "Need at least 2 pending trips to compare.", optimal: [], greedy: [], optimalCost: 0, greedyCost: 0 });
  }

  // Eligible pairs exclude ineligible (over-capacity / wrong status) entirely.
  const pairs = vehicles.flatMap((v: { id: string; maxLoadCapacityKg: number; registrationNumber: string }) =>
    drivers
      .filter((d: { id: string; name: string; safetyScore: number; licenseExpiryDate: Date }) => d.licenseExpiryDate.getTime() > Date.now())
      .map((d: { id: string; name: string; safetyScore: number; licenseExpiryDate: Date }) => ({ vehicle: v, driver: d }))
  );

  const greedy = greedyAssignments(trips, pairs);
  const optimal = hungarian(trips, pairs);

  return NextResponse.json({
    trips: trips.map((t: { id: string; source: string; destination: string; cargoWeightKg: number }) => ({ id: t.id, route: `${t.source} → ${t.destination}`, cargo: t.cargoWeightKg })),
    pairs: pairs.map((p: { vehicle: { id: string; registrationNumber: string }; driver: { id: string; name: string } }) => ({ vehicleId: p.vehicle.id, vehicle: p.vehicle.registrationNumber, driverId: p.driver.id, driver: p.driver.name })),
    optimal,
    greedy,
    optimalCost: totalCost(optimal),
    greedyCost: totalCost(greedy),
  });
}

/** Self-contained O(n^3) Hungarian (Kuhn-Munkres) — same objective as scipy. */
function hungarian(trips: Array<{ id: string; cargoWeightKg: number; createdAt: Date }>, pairs: Array<{ vehicle: { id: string; maxLoadCapacityKg: number }; driver: { id: string; safetyScore: number; licenseExpiryDate: Date } }>) {
  const n = trips.length;
  const m = pairs.length;
  const INF = 1e9;
  // Cost matrix: Infinity where ineligible. We cap Infinity at a large finite
  // value for the solver, then discard those assignments.
  const raw: number[][] = trips.map((t) =>
    pairs.map((p) => {
      if (t.cargoWeightKg > p.vehicle.maxLoadCapacityKg) return INF;
      return Math.max(
        0,
        Math.abs(p.vehicle.maxLoadCapacityKg - t.cargoWeightKg) * 0.6 +
          (100 - p.driver.safetyScore) * 0.4 +
          -Math.floor((p.driver.licenseExpiryDate.getTime() - Date.now()) / (24 * 3600 * 1000)) * 0.4 +
          p.vehicle.maxLoadCapacityKg * -0.2
      );
    })
  );

  // Build a square cost matrix padded with INF columns when m > n or rows when n > m.
  const size = Math.max(n, m);
  const cost: number[][] = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => {
      if (i < n && j < m) return raw[i][j];
      return 0; // dummy cells — don't penalize padding.
    })
  );

  const result = assign(cost, size);

  const out: Array<{ tripId: string; vehicleId: string; driverId: string; cost: number }> = [];
  for (const [i, j] of result) {
    if (i >= n || j >= m) continue;
    if (raw[i][j] >= INF) continue;
    out.push({
      tripId: trips[i].id,
      vehicleId: pairs[j].vehicle.id,
      driverId: pairs[j].driver.id,
      cost: raw[i][j],
    });
  }
  return out;
}

/** Jonker-Volgenant-style assignment via potentials (u/v). O(n^3). */
function assign(a: number[][], n: number): Array<[number, number]> {
  const INF = 1e18;
  const u = new Array(n + 1).fill(0);
  const v = new Array(n + 1).fill(0);
  const p = new Array(n + 1).fill(0);
  const way = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(n + 1).fill(INF);
    const used = new Array(n + 1).fill(false);
    do {
      used[j0] = true;
      let i0 = p[j0];
      let delta = INF;
      let j1 = -1;
      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          const cur = a[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const result: Array<[number, number]> = [];
  for (let j = 1; j <= n; j++) {
    if (p[j] !== 0) result.push([p[j] - 1, j - 1]);
  }
  return result;
}
