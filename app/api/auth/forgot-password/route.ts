import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.notificationLog.create({
        data: {
          userId: user.id,
          type: "COMPLIANCE_EVENT",
          title: "Password reset requested",
          body: "Password reset email simulated in development mode.",
        },
      });
    }
  }

  return NextResponse.json({ ok: true, message: "If your email exists, a reset link has been sent." });
}
