import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db/prisma";
import { Users } from "lucide-react";

function toneForStatus(status: string) {
  if (status === "AVAILABLE") return "success";
  if (status === "ON_TRIP") return "info";
  if (status === "OFF_DUTY") return "warning";
  return "danger";
}

export default async function DriversPage() {
  const drivers = await prisma.driver.findMany({ orderBy: { name: "asc" } });

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold">Drivers</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">License compliance, safety score, and duty status.</p>
        </div>
        {drivers.length === 0 ? (
          <EmptyState title="No drivers yet" description="Add a driver profile before assigning trips." actionHref="/api/drivers" actionLabel="Add driver" icon={<Users size={20} />} />
        ) : (
          <Card className="p-0">
            <DataTable>
              <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">License</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Safety Score</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver: { id: string; name: string; licenseNumber: string; licenseCategory: string; licenseExpiryDate: Date; safetyScore: number; status: string }) => (
                  <tr key={driver.id} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{driver.name}</td>
                    <td className="px-4 py-3">{driver.licenseNumber}</td>
                    <td className="px-4 py-3">{driver.licenseCategory}</td>
                    <td className="px-4 py-3">{driver.licenseExpiryDate.toLocaleDateString()}</td>
                    <td className="px-4 py-3 tabular-nums">{driver.safetyScore}</td>
                    <td className="px-4 py-3"><Badge tone={toneForStatus(driver.status)}>{driver.status.replaceAll("_", " ")}</Badge></td>
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
