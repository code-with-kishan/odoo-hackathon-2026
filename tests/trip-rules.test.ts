/**
 * Trip validation pipeline tests — the shared function both manual entry and AI
 * intake must call (Spec rule 10).
 *
 * Spec reference: IronRoute_FINAL_Build_Spec.md Section 6 business rules 2–5.
 */
import { describe, it, expect } from "vitest";
import { validateTripAssignment } from "@/lib/validation/trip";
import { canTransition } from "@/lib/trips/rules";

describe("validateTripAssignment", () => {
  const baseVehicle = { id: "v1", status: "AVAILABLE", maxLoadCapacityKg: 500 };
  const baseDriver = { id: "d1", status: "AVAILABLE", licenseExpiryDate: new Date(Date.now() + 90 * 24 * 3600 * 1000) };

  it("passes for eligible vehicle + driver", () => {
    const r = validateTripAssignment({ cargoWeightKg: 400, vehicle: baseVehicle, driver: baseDriver });
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  // Rule 2: Retired or In Shop vehicles never appear in dispatch.
  it("rejects IN_SHOP vehicle", () => {
    const r = validateTripAssignment({ cargoWeightKg: 100, vehicle: { ...baseVehicle, status: "IN_SHOP" }, driver: baseDriver });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("Selected vehicle is not eligible for dispatch.");
  });

  it("rejects RETIRED vehicle", () => {
    const r = validateTripAssignment({ cargoWeightKg: 100, vehicle: { ...baseVehicle, status: "RETIRED" }, driver: baseDriver });
    expect(r.valid).toBe(false);
  });

  // Rule 4: A vehicle On Trip cannot be assigned.
  it("rejects ON_TRIP vehicle", () => {
    const r = validateTripAssignment({ cargoWeightKg: 100, vehicle: { ...baseVehicle, status: "ON_TRIP" }, driver: baseDriver });
    expect(r.valid).toBe(false);
  });

  // Rule 3: Drivers with expired licenses or Suspended status cannot be assigned.
  it("rejects Suspended driver", () => {
    const r = validateTripAssignment({ cargoWeightKg: 100, vehicle: baseVehicle, driver: { ...baseDriver, status: "SUSPENDED" } });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("Selected driver is not eligible for dispatch.");
  });

  it("rejects driver with expired license", () => {
    const r = validateTripAssignment({ cargoWeightKg: 100, vehicle: baseVehicle, driver: { ...baseDriver, licenseExpiryDate: new Date(Date.now() - 10 * 24 * 3600 * 1000) } });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("Driver license has expired.");
  });

  // Rule 5: Cargo Weight must not exceed vehicle max load capacity.
  it("rejects cargo exceeding capacity with specific message", () => {
    const r = validateTripAssignment({ cargoWeightKg: 600, vehicle: baseVehicle, driver: baseDriver });
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("Cargo weight exceeds this vehicle's 500kg capacity.");
  });

  it("passes for cargo exactly at capacity", () => {
    const r = validateTripAssignment({ cargoWeightKg: 500, vehicle: baseVehicle, driver: baseDriver });
    expect(r.valid).toBe(true);
  });
});

describe("Trip lifecycle transitions", () => {
  it("Draft can transition to Dispatched", () => {
    expect(canTransition("DRAFT", "DISPATCHED")).toBe(true);
  });
  it("Draft can transition to Cancelled", () => {
    expect(canTransition("DRAFT", "CANCELLED")).toBe(true);
  });
  it("Draft cannot transition to Completed", () => {
    expect(canTransition("DRAFT", "COMPLETED")).toBe(false);
  });
  it("Dispatched can transition to Completed", () => {
    expect(canTransition("DISPATCHED", "COMPLETED")).toBe(true);
  });
  it("Dispatched can transition to Cancelled", () => {
    expect(canTransition("DISPATCHED", "CANCELLED")).toBe(true);
  });
  it("Completed cannot transition to anything", () => {
    expect(canTransition("COMPLETED", "DISPATCHED")).toBe(false);
    expect(canTransition("COMPLETED", "CANCELLED")).toBe(false);
  });
  it("Cancelled cannot transition to anything", () => {
    expect(canTransition("CANCELLED", "DISPATCHED")).toBe(false);
  });
});
