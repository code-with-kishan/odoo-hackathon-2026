import { SignJWT, jwtVerify } from "jose";
import { compareSync } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { RoleName } from "@prisma/client";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "ironroute-dev-secret");
const COOKIE_NAME = "ironroute_session";

export type SessionUser = { id: string; email: string; role: RoleName; name: string };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) return null;
  if (!compareSync(password, user.passwordHash)) return null;
  return { id: user.id, email: user.email, role: user.role.name, name: user.name };
}
