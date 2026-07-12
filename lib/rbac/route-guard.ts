import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { Permission, can } from "@/lib/rbac/permissions";

export async function withPermission(permission: Permission) {
  const user = await getSessionUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  if (!can(user.role, permission)) return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  return { response: null, user };
}
