import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Truck } from "lucide-react";

function toneForStatus(status: string) {
  if (status === "AVAILABLE") return "success";
  if (status === "IN_SHOP") return "warning";
  if (status === "ON_TRIP") return "info";
  return "danger";
}

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({ include: { documents: true }, orderBy: { registrationNumber: "asc" } });

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold">Vehicles</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Registry, capacity, and document expiry tracking.</p>
        </div>
        {vehicles.length === 0 ? (
          <EmptyState title="No vehicles yet" description="Create the first vehicle record to start dispatching jobs." actionHref="/api/vehicles" actionLabel="Add vehicle" icon={<Truck size={20} />} />
        ) : (
          <Card className="p-0">
            <div className="overflow-hidden rounded-[8px]">
              <DataTable>
                <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                  <tr>
                    <th className="px-4 py-3">Registration</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle: { id: string; registrationNumber: string; nameModel: string; type: string; maxLoadCapacityKg: number; region: string; status: string; documents: Array<unknown> }) => (
                    <tr key={vehicle.id} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{vehicle.registrationNumber}</td>
                      <td className="px-4 py-3">{vehicle.nameModel}</td>
                      <td className="px-4 py-3">{vehicle.type}</td>
                      <td className="px-4 py-3 tabular-nums">{vehicle.maxLoadCapacityKg} kg</td>
                      <td className="px-4 py-3">{vehicle.region}</td>
                      <td className="px-4 py-3"><Badge tone={toneForStatus(vehicle.status)}>{vehicle.status.replaceAll("_", " ")}</Badge></td>
                      <td className="px-4 py-3 tabular-nums">{vehicle.documents.length}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
