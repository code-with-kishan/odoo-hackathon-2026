import type { RoleName } from "@/lib/domain/enums";

export type Permission =
  | "trip:create"
  | "trip:dispatch"
  | "vehicle:manage"
  | "driver:manage"
  | "maintenance:approve"
  | "reports:view_financial"
  | "admin:configure";

const matrix: Record<RoleName, Permission[]> = {
  FLEET_MANAGER: ["trip:create", "trip:dispatch", "vehicle:manage", "driver:manage", "maintenance:approve"],
  DRIVER: ["trip:create"],
  SAFETY_OFFICER: ["driver:manage"],
  FINANCIAL_ANALYST: ["reports:view_financial"],
  ADMIN: ["trip:create", "trip:dispatch", "vehicle:manage", "driver:manage", "maintenance:approve", "reports:view_financial", "admin:configure"],
};

export function can(role: RoleName, permission: Permission) {
  return matrix[role].includes(permission);
}

export function assertPermission(role: RoleName, permission: Permission) {
  if (!can(role, permission)) {
    throw new Error(`Forbidden: ${role} cannot ${permission}`);
  }
}
