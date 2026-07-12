/**
 * Notification scan — produces license/document expiry and predictive-maintenance
 * in-app notifications (and logs an "email" in dev). Idempotent per subject via
 * a dedup key stored in NotificationLog.title.
 *
 * Spec reference: IronRoute_FINAL_Build_Spec.md Section 4.9 / Phase 8.
 */
import { prisma } from "@/lib/db/prisma";
import type { NotificationType } from "@/lib/domain/enums";
import { predictNextService } from "@/lib/maintenance/predict";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ScanOptions = {
  /** Look-ahead window for "expiring within N days" reminders. */
  expiryWindowDays?: number;
  now?: Date;
  actorUserId?: string;
};

export type ScanResult = {
  created: number;
  items: Array<{ type: NotificationType; title: string; body: string; userId: string | null }>;
};

function dedupKey(type: NotificationType, entityId: string, windowLabel: string) {
  return `[${type}:${entityId}:${windowLabel}]`;
}

export async function runNotificationScan(opts: ScanOptions = {}): Promise<ScanResult> {
  const now = opts.now ?? new Date();
  const windowDays = opts.expiryWindowDays ?? 30;
  const horizon = new Date(now.getTime() + windowDays * MS_PER_DAY);

  const items: ScanResult["items"] = [];

  const admins = await prisma.user.findMany({
    include: { role: true },
    where: { role: { name: { in: ["ADMIN", "SAFETY_OFFICER", "FLEET_MANAGER"] } } },
  });

  const fallbackUser = await prisma.user.findFirst();
  const actorId = opts.actorUserId ?? fallbackUser?.id ?? "";

  // 0. Automated Driver License Suspension - set status to SUSPENDED if license is expired
  const expiredDrivers = await prisma.driver.findMany({
    where: { licenseExpiryDate: { lt: now }, status: { not: "SUSPENDED" } },
  });

  for (const d of expiredDrivers) {
    await prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id: d.id },
        data: { status: "SUSPENDED" }
      });

      if (actorId) {
        await tx.auditLog.create({
          data: {
            actorUserId: actorId,
            entity: "Driver",
            entityId: d.id,
            action: "AUTO_SUSPEND_EXPIRED_LICENSE",
            beforeState: JSON.stringify({ status: d.status }),
            afterState: JSON.stringify({ status: "SUSPENDED" }),
          }
        });
      }
    });

    const title = dedupKey("LICENSE_EXPIRY", d.id, "expired-suspend");
    for (const u of admins) {
      items.push({
        type: "LICENSE_EXPIRY",
        title,
        body: `Driver ${d.name}'s license expired. Status automatically transitioned to SUSPENDED.`,
        userId: u.id,
      });
    }
  }

  // 1. Driver license expiry — notify admins + each safety/manager role' first user.
  const expiringDrivers = await prisma.driver.findMany({
    where: { licenseExpiryDate: { gte: now, lte: horizon } },
  });

  for (const d of expiringDrivers) {
    const days = Math.ceil((d.licenseExpiryDate.getTime() - now.getTime()) / MS_PER_DAY);
    const title = dedupKey("LICENSE_EXPIRY", d.id, `${days}d`);
    for (const u of admins) {
      items.push({
        type: "LICENSE_EXPIRY",
        title,
        body: `Driver ${d.name}'s license (${d.licenseNumber}) expires in ${days} day(s).`,
        userId: u.id,
      });
    }
  }

  // 2. Vehicle document expiry.
  const expiringDocs = await prisma.vehicleDocument.findMany({
    where: { expiresAt: { gte: now, lte: horizon } },
    include: { vehicle: true },
  });
  for (const doc of expiringDocs) {
    const days = Math.ceil((doc.expiresAt.getTime() - now.getTime()) / MS_PER_DAY);
    const title = dedupKey("DOCUMENT_EXPIRY", doc.id, `${days}d`);
    for (const u of admins) {
      items.push({
        type: "DOCUMENT_EXPIRY",
        title,
        body: `${doc.type} for ${doc.vehicle.registrationNumber} expires in ${days} day(s).`,
        userId: u.id,
      });
    }
  }

  // 3. Predictive maintenance window approaching.
  const vehicles = await prisma.vehicle.findMany({
    include: { maintenanceLogs: { orderBy: { openedAt: "asc" } } },
  });
  for (const v of vehicles) {
    const prediction = predictNextService(
      v.maintenanceLogs.map((m) => ({ openedAt: m.openedAt, odometerKm: v.odometerKm })),
      { now }
    );
    if (prediction.predicted && prediction.daysUntilDue <= 14) {
      const title = dedupKey("MAINTENANCE_DUE", v.id, `${prediction.daysUntilDue}d`);
      for (const u of admins) {
        items.push({
          type: "MAINTENANCE_DUE",
          title,
          body: `${v.registrationNumber} predicted service in ${prediction.daysUntilDue} day(s) (${prediction.method}).`,
          userId: u.id,
        });
      }
    }
  }

  // De-duplicate against already-sent notifications (by title key per user).
  const existing = await prisma.notificationLog.findMany({
    where: { title: { in: items.map((i) => i.title) } },
    select: { userId: true, title: true },
  });
  const seen = new Set(existing.map((e) => `${e.userId}:${e.title}`));
  const fresh = items.filter((i) => !seen.has(`${i.userId}:${i.title}`));

  if (fresh.length > 0) {
    await prisma.notificationLog.createMany({ data: fresh });
    // Dev "email": transactional providers (Resend/SendGrid) would be wired here.
    // We log so acceptance can confirm an email attempt occurred in development.
    for (const f of fresh) console.log(`[email:dev] -> ${f.userId}: ${f.body}`);
  }

  return { created: fresh.length, items: fresh };
}
