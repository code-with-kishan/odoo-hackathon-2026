import type { RoleName } from "@/lib/domain/enums";
import { getSessionUser } from "@/lib/auth/session";

export async function getCurrentRole(): Promise<RoleName> {
  const user = await getSessionUser();
  return user?.role ?? "ADMIN";
}
