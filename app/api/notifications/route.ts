import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { runNotificationScan } from "@/lib/notifications/scan";

// Notification center: list notifications for the current user (and broadcast
// ones targeted at their role/userId). Open to any authenticated user.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.notificationLog.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: { sentAt: "desc" },
    take: 50,
  });
  return NextResponse.json(list);
}

// Trigger a scan (license/document expiry + predictive maintenance). Any
// authenticated user may refresh; the scan is idempotent per (subject, window).
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await runNotificationScan({ actorUserId: user.id });
  return NextResponse.json({ created: result.created });
}
