import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { FuelExpenseForm } from "@/components/fuel/fuel-expense-form";
import { prisma } from "@/lib/db/prisma";
import { WalletCards } from "lucide-react";

export default async function Page() {
  const [fuelLogs, expenses, vehicles] = await Promise.all([
    prisma.fuelLog.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } }),
    prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } }),
    prisma.vehicle.findMany({ orderBy: { registrationNumber: "asc" } }),
  ]);
  const totalFuelCost = fuelLogs.reduce((sum: number, entry: { cost: number }) => sum + entry.cost, 0);
  const totalExpenses = expenses.reduce((sum: number, entry: { amount: number }) => sum + entry.amount, 0);

  // Build per-vehicle baseline + flag anomalies (Phase 7 acceptance).
  // This runs server-side using the same lib as the API route.
  const { flagAnomalies } = await import("@/lib/fuel/anomaly");
  const byVehicle: Record<string, Array<(typeof fuelLogs)[number]>> = {};
  for (const f of fuelLogs) (byVehicle[f.vehicleId] ??= []).push(f);
  const anomalies = flagAnomalies(byVehicle);

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold">Fuel & Expenses</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Operational cost rollup with fuel-efficiency tracking and z-score anomaly detection.</p>
        </div>

        <Card>
          <h3 className="text-[16px] font-medium">Log new entry</h3>
          <div className="mt-3">
            <FuelExpenseForm
              vehicles={vehicles.map((v: { id: string; registrationNumber: string }) => ({ id: v.id, registrationNumber: v.registrationNumber }))}
            />
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">Fuel cost</p><p className="mt-2 text-[22px] font-semibold tabular-nums">${totalFuelCost.toFixed(2)}</p></Card>
          <Card><p className="text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">Other expenses</p><p className="mt-2 text-[22px] font-semibold tabular-nums">${totalExpenses.toFixed(2)}</p></Card>
          <Card>
            <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">Total operational</p>
            <p className="mt-2 text-[22px] font-semibold tabular-nums">${(totalFuelCost + totalExpenses).toFixed(2)}</p>
          </Card>
        </div>

        {/* Anomaly highlights (Phase 7 acceptance: seeded anomalous fuel log is flagged with deviation) */}
        {Object.values(anomalies).some((a) => a.isAnomaly) && (
          <Card>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-medium">Flagged anomalies</h3>
              <Badge tone="danger">Statistical anomaly detection</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {Object.values(anomalies)
                .filter((a) => a.isAnomaly)
                .map((a) => (
                  <div key={a.id} className="rounded-[8px] border border-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] p-3">
                    <p className="text-[13px] text-[var(--color-danger)]">
                      z-score = {a.zScore} · observed {a.observed}L vs baseline {a.baseline}L ({a.deviation})
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{a.explanation}</p>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {fuelLogs.length === 0 && expenses.length === 0 ? (
          <EmptyState title="No cost entries yet" description="Log fuel and expense entries to compute vehicle operating cost." actionHref="/api/vehicles" actionLabel="Review vehicles" icon={<WalletCards size={20} />} />
        ) : (
          <Card className="p-0">
            <DataTable>
              <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Liters</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Flag</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((entry: { id: string; vehicle: { registrationNumber: string }; liters: number; cost: number; date: Date }) => {
                  const anomaly = anomalies[entry.id];
                  return (
                    <tr key={entry.id} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                      <td className="px-4 py-3 font-medium">{entry.vehicle.registrationNumber}</td>
                      <td className="px-4 py-3">Fuel</td>
                      <td className="px-4 py-3 tabular-nums">{entry.liters}</td>
                      <td className="px-4 py-3 tabular-nums">${entry.cost.toFixed(2)}</td>
                      <td className="px-4 py-3">{entry.date.toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {anomaly?.isAnomaly ? (
                          <Badge tone="danger">Anomaly (z={anomaly.zScore})</Badge>
                        ) : (
                          <Badge tone="info">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {expenses.map((entry: { id: string; vehicle: { registrationNumber: string }; category: string; amount: number; date: Date }) => (
                  <tr key={entry.id} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3 font-medium">{entry.vehicle.registrationNumber}</td>
                    <td className="px-4 py-3">{entry.category}</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3 tabular-nums">${entry.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">{entry.date.toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge tone="warning">Review</Badge></td>
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
