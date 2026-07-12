import { Driver, Trip, Vehicle } from "@prisma/client";
import { spawnSync } from "node:child_process";

type Pair = { vehicle: Vehicle; driver: Driver; score: number };

export function buildEligiblePairs(vehicles: Vehicle[], drivers: Driver[]) {
  return vehicles.flatMap((vehicle) =>
    drivers
      .filter((driver) => driver.status === "AVAILABLE" && driver.licenseExpiryDate.getTime() > Date.now())
      .filter(() => vehicle.status === "AVAILABLE")
      .map((driver) => ({
        vehicle,
        driver,
        score: (1000 - vehicle.maxLoadCapacityKg) * 0.2 + (100 - driver.safetyScore) * 0.4 + daysToExpiry(driver.licenseExpiryDate) * -0.4,
      }))
  );
}

function daysToExpiry(date: Date) {
  return Math.floor((date.getTime() - Date.now()) / (24 * 3600 * 1000));
}

export function buildCostMatrix(trips: Trip[], pairs: Pair[]) {
  return trips.map((trip) =>
    pairs.map((pair) => {
      if (trip.cargoWeightKg > pair.vehicle.maxLoadCapacityKg) return Number.POSITIVE_INFINITY;
      const capacityFit = Math.abs(pair.vehicle.maxLoadCapacityKg - trip.cargoWeightKg);
      return Math.max(0, pair.score + capacityFit * 0.6);
    })
  );
}

export function optimizeAssignments(trips: Trip[], pairs: Pair[]) {
  const matrix = buildCostMatrix(trips, pairs);
  const finitePairs = pairs.map((_, idx) => idx).filter((idx) => matrix.some((row) => Number.isFinite(row[idx])));
  const filteredMatrix = matrix.map((row) => finitePairs.map((idx) => (Number.isFinite(row[idx]) ? row[idx] : 1e9)));
  const pyResult = spawnSync("python3", ["/home/runner/work/odoo-hackathon-2026/odoo-hackathon-2026/lib/optimizer/solver.py"], {
    input: JSON.stringify({ matrix: filteredMatrix }),
    encoding: "utf8",
  });

  if (pyResult.status !== 0 || !pyResult.stdout) return [];
  const assignments: Array<{ tripIndex: number; pairIndex: number; cost: number }> = JSON.parse(pyResult.stdout);

  return assignments
    .map((a) => ({
      tripId: trips[a.tripIndex]?.id,
      vehicleId: pairs[finitePairs[a.pairIndex]]?.vehicle.id,
      driverId: pairs[finitePairs[a.pairIndex]]?.driver.id,
      cost: a.cost,
    }))
    .filter((a) => a.tripId && a.vehicleId && a.driverId);
}
