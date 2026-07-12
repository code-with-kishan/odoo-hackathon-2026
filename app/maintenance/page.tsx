import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { CloseMaintenanceButton } from "@/components/maintenance/close-button";
import { prisma } from "@/lib/db/prisma";
import { Wrench } from "lucide-react";
import { predictNextService } from "@/lib/maintenance/predict";

export default async function Page() {
  const [records, vehicles] = await Promise.all([
    prisma.maintenanceLog.findMany({ include: { vehicle: true }, orderBy: { openedAt: "desc" } }),
    prisma.vehicle.findMany({ orderBy: { registrationNumber: "asc" } }),
  ]);

  // Compute predicted-service badge per vehicle (Phase 7 acceptance).
  const predictions = new Map<string, ReturnType<typeof predictNextService>>();
  for (const v of vehicles) {
    const history = records
      .filter((r: { vehicleId: string }) => r.vehicleId === v.id)
      .map((r: { openedAt: Date }) => ({ openedAt: r.openedAt, odometerKm: v.odometerKm }));
    predictions.set(v.id, predictNextService(history));
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold">Maintenance</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Open work orders with status cascades and predicted service windows.</p>
        </div>

        <Card>
          <h3 className="text-[16px] font-medium">Open new record</h3>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">Vehicle will move to In Shop and be hidden from dispatch.</p>
          <div className="mt-3">
            <MaintenanceForm
              vehicles={vehicles.map((v: { id: string; registrationNumber: string; status: string }) => ({ id: v.id, registrationNumber: v.registrationNumber, status: v.status }))}
            />
          </div>
        </Card>

        {/* Predicted-service badges (Phase 7) */}
        <Card>
          <h3 className="text-[16px] font-medium">Predicted service windows</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {vehicles.slice(0, 6).map((v: { id: string; registrationNumber: string }) => {
              const p = predictions.get(v.id);
              if (!p || !p.predicted) return null;
              const approaching = p.daysUntilDue <= 14;
              return (
                <div key={v.id} className="rounded-[8px] border border-[var(--color-border-soft)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{v.registrationNumber}</span>
                    <Badge tone={approaching ? "warning" : "info"}>
                      {p.method === "linear-regression" ? `Regression` : "Static fallback"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] tabular-nums text-[var(--color-text-muted)]">
                    {p.daysUntilDue > 0 ? `${p.daysUntilDue} days until due` : "Overdue"}
                    {p.method === "linear-regression" ? ` · confidence ${p.confidence}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {records.length === 0 ? (
          <EmptyState title="No maintenance records" description="Open a maintenance record to move a vehicle into the shop queue." actionHref="/api/trips" actionLabel="Review trips" icon={<Wrench size={20} />} />
        ) : (
          <Card className="p-0">
            <DataTable>
              <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Opened</th>
                  <th className="px-4 py-3">Closed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record: { id: string; vehicle: { registrationNumber: string }; description: string; openedAt: Date; closedAt: Date | null; isOpen: boolean }) => (
                  <tr key={record.id} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3 font-medium">{record.vehicle.registrationNumber}</td>
                    <td className="px-4 py-3">{record.description}</td>
                    <td className="px-4 py-3">{record.openedAt.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{record.closedAt ? record.closedAt.toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><Badge tone={record.isOpen ? "warning" : "success"}>{record.isOpen ? "Open" : "Closed"}</Badge></td>
                    <td className="px-4 py-3">
                      {record.isOpen && <CloseMaintenanceButton id={record.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
