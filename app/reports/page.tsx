import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table";
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { prisma } from "@/lib/db/prisma";
import { buildReportRows } from "@/lib/reports/export";
import { Download } from "lucide-react";

const PIE_COLORS = ["#2383E2", "#E8A33D", "#2F9E44", "#E0393E"];

export default async function Page() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      maintenanceLogs: true,
      fuelLogs: true,
      expenses: true,
      trips: { where: { status: "COMPLETED" } },
    },
    orderBy: { registrationNumber: "asc" },
  });

  const rows = buildReportRows(vehicles);

  const totalFuel = rows.reduce((s: number, r: { fuelCost: number }) => s + r.fuelCost, 0);
  const totalMaint = rows.reduce((s: number, r: { maintenanceCost: number }) => s + r.maintenanceCost, 0);
  const totalExpense = rows.reduce((s: number, r: { otherCost: number }) => s + r.otherCost, 0);
  const totalRevenue = rows.reduce((s: number, r: { revenue: number }) => s + r.revenue, 0);
  const avgROI = rows.length ? rows.reduce((s: number, r: { roi: number }) => s + r.roi, 0) / rows.length : 0;

  const costDonut = [
    { name: "Fuel", value: totalFuel },
    { name: "Maintenance", value: totalMaint },
    { name: "Other", value: totalExpense },
  ];

  const summaryCards = [
    { label: "Total Revenue (est.)", value: `$${totalRevenue.toFixed(0)}` },
    { label: "Total Cost", value: `$${(totalFuel + totalMaint + totalExpense).toFixed(0)}` },
    { label: "Avg. ROI", value: `${(avgROI * 100).toFixed(1)}%` },
    { label: "Vehicles", value: vehicles.length },
  ];

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold">Reports</h2>
            <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Operational cost, utilization, and fleet ROI. ROI = (Revenue − Maintenance − Fuel) / Acquisition Cost.</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/reports/export?format=csv">
              <Button variant="secondary"><Download size={14} /> Export CSV</Button>
            </a>
            <a href="/api/reports/export?format=pdf">
              <Button variant="secondary"><Download size={14} /> Export PDF</Button>
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <Card key={item.label} className="p-6">
              <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">{item.label}</p>
              <p className="mt-2 text-[32px] font-semibold tabular-nums">{item.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-2 text-[16px] font-medium">Cost breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costDonut} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {costDonut.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h3 className="mb-2 text-[16px] font-medium">Fuel efficiency by vehicle</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows.map((r: { registration: string; fuelCost: number }) => ({ name: r.registration, fuel: r.fuelCost }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuel" fill="var(--color-warning)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ROI table per vehicle */}
        <Card className="p-0">
          <DataTable>
            <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Acquisition</th>
                <th className="px-4 py-3">Fuel</th>
                <th className="px-4 py-3">Maint.</th>
                <th className="px-4 py-3">Other</th>
                <th className="px-4 py-3">Total Cost</th>
                <th className="px-4 py-3">Revenue (est.)</th>
                <th className="px-4 py-3">ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: { registration: string; acquisitionCost: number; fuelCost: number; maintenanceCost: number; otherCost: number; totalCost: number; revenue: number; roi: number }) => (
                <tr key={r.registration} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                  <td className="px-4 py-3 font-medium">{r.registration}</td>
                  <td className="px-4 py-3 tabular-nums">${r.acquisitionCost.toFixed(0)}</td>
                  <td className="px-4 py-3 tabular-nums">${r.fuelCost.toFixed(0)}</td>
                  <td className="px-4 py-3 tabular-nums">${r.maintenanceCost.toFixed(0)}</td>
                  <td className="px-4 py-3 tabular-nums">${r.otherCost.toFixed(0)}</td>
                  <td className="px-4 py-3 tabular-nums">${r.totalCost.toFixed(0)}</td>
                  <td className="px-4 py-3 tabular-nums">${r.revenue.toFixed(0)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    <Badge tone={r.roi >= 0 ? "success" : "danger"}>{(r.roi * 100).toFixed(1)}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Card>
      </div>
    </AppShell>
  );
}
