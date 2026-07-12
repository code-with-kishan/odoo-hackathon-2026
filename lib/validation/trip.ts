import { DriverStatus, VehicleStatus } from "@prisma/client";

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
    if ([VehicleStatus.IN_SHOP, VehicleStatus.RETIRED, VehicleStatus.ON_TRIP].includes(input.vehicle.status)) {
      errors.push("Selected vehicle is not eligible for dispatch.");
    }
    if (input.cargoWeightKg > input.vehicle.maxLoadCapacityKg) {
      errors.push(`Cargo weight exceeds this vehicle's ${input.vehicle.maxLoadCapacityKg}kg capacity.`);
    }
  }

  if (input.driver) {
    if ([DriverStatus.SUSPENDED, DriverStatus.ON_TRIP].includes(input.driver.status)) {
      errors.push("Selected driver is not eligible for dispatch.");
    }
    if (input.driver.licenseExpiryDate.getTime() < Date.now()) {
      errors.push("Driver license has expired.");
    }
  }

  return { valid: errors.length === 0, errors };
}
