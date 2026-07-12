import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { z } from "zod";

/**
 * Vehicle document management. In production the file is streamed to S3
 * (Section 7); here we accept the upload, record a key, and persist the expiry
 * date that feeds the notification pipeline (Section 4.9).
 */
export async function GET() {
  const guard = await withPermission("vehicle:manage");
  if (guard.response) return guard.response;

  const docs = await prisma.vehicleDocument.findMany({
    include: { vehicle: true },
    orderBy: { expiresAt: "asc" },
  });
  return NextResponse.json(docs);
}

const uploadSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.enum(["Insurance", "Registration", "Permit", "Other"]),
  fileName: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  /** base64 payload — decoded length used as the stored "size". */
  data: z.string().min(1),
  expiresAt: z.string().min(1),
});

export async function POST(req: Request) {
  const guard = await withPermission("vehicle:manage");
  if (guard.response) return guard.response;

  const body = await req.json();
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: parsed.data.vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });

  // S3-compatible key. We do not persist the bytes in dev; the key + expiry are
  // what the UI and notification pipeline need.
  const fileKey = `docs/${vehicle.registrationNumber}/${Date.now()}-${parsed.data.fileName.replace(/\s+/g, "-")}`;

  const doc = await prisma.vehicleDocument.create({
    data: {
      vehicleId: vehicle.id,
      type: parsed.data.type,
      fileKey,
      expiresAt: new Date(parsed.data.expiresAt),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: guard.user!.id,
      entity: "VehicleDocument",
      entityId: doc.id,
      action: "UPLOAD",
      afterState: JSON.stringify({ type: doc.type, fileKey, expiresAt: doc.expiresAt.toISOString() }),
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
