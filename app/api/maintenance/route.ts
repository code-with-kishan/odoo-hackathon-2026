import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { predictNextService } from "@/lib/maintenance/predict";
import { z } from "zod";

const createSchema = z.object({
  vehicleId: z.string().min(1),
  description: z.string().trim().min(1, "Description is required."),
});

export async function GET() {
  const guard = await withPermission("maintenance:approve");
  if (guard.response) return guard.response;

  const records = await prisma.maintenanceLog.findMany({
    include: { vehicle: { include: { maintenanceLogs: { orderBy: { openedAt: "asc" } } } } },
    orderBy: { openedAt: "desc" },
  });

  // Attach predicted service window for each vehicle (Phase 7 acceptance).
  const enriched = records.map((r: { vehicle: { maintenanceLogs: { openedAt: Date }[]; odometerKm: number } }) => {
    const prediction = predictNextService(
      r.vehicle.maintenanceLogs.map((m) => ({ openedAt: m.openedAt, odometerKm: r.vehicle.odometerKm }))
    );
    return { ...r, prediction };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const guard = await withPermission("maintenance:approve");
  if (guard.response) return guard.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: parsed.data.vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  if (vehicle.status === "RETIRED") {
    return NextResponse.json({ error: "Cannot open maintenance on a retired vehicle." }, { status: 400 });
  }

  // Rule 9: creating a maintenance record moves the vehicle into IN_SHOP.
  const [record] = await prisma.$transaction([
    prisma.maintenanceLog.create({ data: { vehicleId: vehicle.id, description: parsed.data.description } }),
    prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: "IN_SHOP" },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: guard.user!.id,
        entity: "Vehicle",
        entityId: vehicle.id,
        action: "STATUS_IN_SHOP",
        beforeState: { status: vehicle.status },
        afterState: { status: "IN_SHOP" },
      },
    }),
  ]);

  return NextResponse.json(record, { status: 201 });
}
