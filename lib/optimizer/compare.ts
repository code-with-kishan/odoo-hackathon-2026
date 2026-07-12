/**
 * Batch dispatch optimizer comparison helpers (additive — does not modify the
 * existing Hungarian-algorithm solver in ./batchOptimize.ts).
 *
 * Spec reference: IronRoute_FINAL_Build_Spec.md Section 4.5 / Phase 5.
 * The single highest-value demo moment is showing the fleet-wide optimal
 * assignment next to what a one-trip-at-a-time greedy pick would produce on the
 * SAME staged scenario, so an untrained viewer can see the difference.
 */
import { Driver, Trip, Vehicle } from "@prisma/client";

export type Pair = { vehicle: Vehicle; driver: Driver };
export type Assignment = {
  tripId: string;
  vehicleId: string;
  driverId: string;
  cost: number;
  label?: string;
};

/** Unit cost of assigning (trip, pair). Ineligible (over-capacity) = Infinity. */
export function pairCost(trip: Trip, pair: Pair): number {
  if (trip.cargoWeightKg > pair.vehicle.maxLoadCapacityKg) return Number.POSITIVE_INFINITY;
  const capacityFit = Math.abs(pair.vehicle.maxLoadCapacityKg - trip.cargoWeightKg);
  const safety = 100 - pair.driver.safetyScore; // lower is better
  const expiryProximity = -Math.floor(
    (pair.driver.licenseExpiryDate.getTime() - Date.now()) / (24 * 3600 * 1000)
  );
  return capacityFit * 0.6 + safety * 0.4 + expiryProximity * 0.4 + pair.vehicle.maxLoadCapacityKg * -0.2;
}

/**
 * Greedy: process trips oldest-first, each takes its lowest-cost remaining pair.
 * This is the strawman the spec wants compared against the Hungarian optimum.
 */
export function greedyAssignments(trips: Trip[], pairs: Pair[]): Assignment[] {
  const ordered = [...trips].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const usedPairs = new Set<number>();
  const out: Assignment[] = [];
  for (const trip of ordered) {
    let bestIdx = -1;
    let bestCost = Number.POSITIVE_INFINITY;
    pairs.forEach((pair, idx) => {
      if (usedPairs.has(idx)) return;
      const c = pairCost(trip, pair);
      if (Number.isFinite(c) && c < bestCost) {
        bestCost = c;
        bestIdx = idx;
      }
    });
    if (bestIdx >= 0) {
      usedPairs.add(bestIdx);
      const p = pairs[bestIdx];
      out.push({ tripId: trip.id, vehicleId: p.vehicle.id, driverId: p.driver.id, cost: bestCost, label: "greedy" });
    }
  }
  return out;
}

/** Total cost of an assignment set, excluding Infinity (unmatched) entries. */
export function totalCost(assignments: Assignment[]): number {
  return assignments.reduce((s, a) => s + (Number.isFinite(a.cost) ? a.cost : 0), 0);
}

export { type Pair as OptimizerPair };
