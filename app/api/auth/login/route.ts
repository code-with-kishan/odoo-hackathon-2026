import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  const user = await authenticate(email, password);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  await createSession(user);
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
