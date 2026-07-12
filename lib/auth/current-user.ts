import { RoleName } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";

export async function getCurrentRole(): Promise<RoleName> {
  const user = await getSessionUser();
  return user?.role ?? RoleName.ADMIN;
}
