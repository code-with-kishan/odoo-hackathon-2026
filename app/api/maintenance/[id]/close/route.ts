import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";

// Rule 9: closing a maintenance record reverts the vehicle to AVAILABLE
// (unless it has been Retired in the meantime).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await withPermission("maintenance:approve");
  if (guard.response) return guard.response;

  const { id } = await params;
  const record = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
  if (!record) return NextResponse.json({ error: "Maintenance record not found." }, { status: 404 });
  if (!record.isOpen) return NextResponse.json({ error: "Record is already closed." }, { status: 400 });

  const nextVehicleStatus =
    record.vehicle.status === "RETIRED" ? "RETIRED" : "AVAILABLE";

  await prisma.$transaction([
    prisma.maintenanceLog.update({ where: { id }, data: { isOpen: false, closedAt: new Date() } }),
    prisma.vehicle.update({ where: { id: record.vehicleId }, data: { status: nextVehicleStatus } }),
    prisma.auditLog.create({
      data: {
        actorUserId: guard.user!.id,
        entity: "Vehicle",
        entityId: record.vehicleId,
        action: `STATUS_${nextVehicleStatus}`,
        beforeState: JSON.stringify({ status: record.vehicle.status }),
        afterState: JSON.stringify({ status: nextVehicleStatus }),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
