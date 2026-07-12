import { z } from "zod";
import type { DriverStatus, VehicleStatus } from "@/lib/domain/enums";

export const tripDraftSchema = z.object({
  source: z.string().trim().min(1, "Source is required."),
  destination: z.string().trim().min(1, "Destination is required."),
  cargoWeightKg: z.coerce.number().positive("Cargo weight must be greater than zero."),
  plannedDistanceKm: z.coerce.number().positive("Planned distance must be greater than zero."),
  vehicleId: z.string().trim().optional().nullable(),
  driverId: z.string().trim().optional().nullable(),
});

export type TripValidationInput = {
  cargoWeightKg: number;
  vehicle: { id: string; status: VehicleStatus; maxLoadCapacityKg: number } | null;
  driver: { id: string; status: DriverStatus; licenseExpiryDate: Date } | null;
};

export type ValidationResult = { valid: boolean; errors: string[] };

export function validateTripAssignment(input: TripValidationInput): ValidationResult {
  const errors: string[] = [];

  if (!input.vehicle) errors.push("Vehicle is required.");
  if (!input.driver) errors.push("Driver is required.");

  if (input.vehicle) {
    if (["IN_SHOP", "RETIRED", "ON_TRIP"].includes(input.vehicle.status)) {
      errors.push("Selected vehicle is not eligible for dispatch.");
    }
    if (input.cargoWeightKg > input.vehicle.maxLoadCapacityKg) {
      errors.push(`Cargo weight exceeds this vehicle's ${input.vehicle.maxLoadCapacityKg}kg capacity.`);
    }
  }

  if (input.driver) {
    if (["SUSPENDED", "ON_TRIP"].includes(input.driver.status)) {
      errors.push("Selected driver is not eligible for dispatch.");
    }
    if (input.driver.licenseExpiryDate.getTime() < Date.now()) {
      errors.push("Driver license has expired.");
    }
  }

  return { valid: errors.length === 0, errors };
}
