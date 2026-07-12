/**
 * RBAC permission matrix tests.
 *
 * Spec reference: IronRoute_FINAL_Build_Spec.md Section 2 / Phase 2.
 * These tests verify server-side permission checks directly (the matrix is
 * enforced server-side on every endpoint, not just hidden in the UI).
 */
import { describe, it, expect } from "vitest";
import { can } from "@/lib/rbac/permissions";
import type { RoleName } from "@/lib/domain/enums";

describe("RBAC permission matrix", () => {
  // Role: FLEET_MANAGER — can manage vehicles, drivers, trips, maintenance; cannot admin or full financial.
  it("FLEET_MANAGER can create trips", () => {
    expect(can("FLEET_MANAGER", "trip:create")).toBe(true);
  });
  it("FLEET_MANAGER can dispatch trips", () => {
    expect(can("FLEET_MANAGER", "trip:dispatch")).toBe(true);
  });
  it("FLEET_MANAGER can manage vehicles", () => {
    expect(can("FLEET_MANAGER", "vehicle:manage")).toBe(true);
  });
  it("FLEET_MANAGER can manage drivers", () => {
    expect(can("FLEET_MANAGER", "driver:manage")).toBe(true);
  });
  it("FLEET_MANAGER can approve maintenance", () => {
    expect(can("FLEET_MANAGER", "maintenance:approve")).toBe(true);
  });
  it("FLEET_MANAGER cannot access admin config", () => {
    expect(can("FLEET_MANAGER", "admin:configure")).toBe(false);
  });
  it("FLEET_MANAGER cannot view full financial reports (export)", () => {
    expect(can("FLEET_MANAGER", "reports:view_financial")).toBe(false);
  });

  // Role: DRIVER — can create own trips only; nothing else.
  it("DRIVER can create trips", () => {
    expect(can("DRIVER", "trip:create")).toBe(true);
  });
  it("DRIVER cannot dispatch trips", () => {
    expect(can("DRIVER", "trip:dispatch")).toBe(false);
  });
  it("DRIVER cannot manage vehicles", () => {
    expect(can("DRIVER", "vehicle:manage")).toBe(false);
  });
  it("DRIVER cannot manage drivers", () => {
    expect(can("DRIVER", "driver:manage")).toBe(false);
  });
  it("DRIVER cannot approve maintenance", () => {
    expect(can("DRIVER", "maintenance:approve")).toBe(false);
  });
  it("DRIVER cannot view financial reports", () => {
    expect(can("DRIVER", "reports:view_financial")).toBe(false);
  });
  it("DRIVER cannot admin", () => {
    expect(can("DRIVER", "admin:configure")).toBe(false);
  });

  // Role: SAFETY_OFFICER — can manage driver compliance fields only.
  it("SAFETY_OFFICER can manage drivers", () => {
    expect(can("SAFETY_OFFICER", "driver:manage")).toBe(true);
  });
  it("SAFETY_OFFICER cannot create trips", () => {
    expect(can("SAFETY_OFFICER", "trip:create")).toBe(false);
  });
  it("SAFETY_OFFICER cannot manage vehicles", () => {
    expect(can("SAFETY_OFFICER", "vehicle:manage")).toBe(false);
  });
  it("SAFETY_OFFICER cannot view financial reports", () => {
    expect(can("SAFETY_OFFICER", "reports:view_financial")).toBe(false);
  });

  // Role: FINANCIAL_ANALYST — can view full financial reports only.
  it("FINANCIAL_ANALYST can view financial reports", () => {
    expect(can("FINANCIAL_ANALYST", "reports:view_financial")).toBe(true);
  });
  it("FINANCIAL_ANALYST cannot create trips", () => {
    expect(can("FINANCIAL_ANALYST", "trip:create")).toBe(false);
  });
  it("FINANCIAL_ANALYST cannot manage vehicles", () => {
    expect(can("FINANCIAL_ANALYST", "vehicle:manage")).toBe(false);
  });
  it("FINANCIAL_ANALYST cannot manage drivers", () => {
    expect(can("FINANCIAL_ANALYST", "driver:manage")).toBe(false);
  });

  // Role: ADMIN — full access to all permissions.
  it("ADMIN can do everything", () => {
    const perms = [
      "trip:create",
      "trip:dispatch",
      "vehicle:manage",
      "driver:manage",
      "maintenance:approve",
      "reports:view_financial",
      "admin:configure",
    ] as const;
    for (const p of perms) {
      expect(can("ADMIN", p)).toBe(true);
    }
  });
});
