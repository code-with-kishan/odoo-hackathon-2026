import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { getCurrentRole } from "@/lib/auth/current-user";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trendData = [
  { month: "Jan", util: 62, cost: 12 },
  { month: "Feb", util: 68, cost: 11 },
  { month: "Mar", util: 71, cost: 14 },
  { month: "Apr", util: 75, cost: 13 },
];

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function DashboardPage() {
  const role = await getCurrentRole();
  const [vehicles, drivers, trips, documents, maintenance] = await Promise.all([
    prisma.vehicle.findMany({ select: { status: true } }),
    prisma.driver.findMany({ select: { status: true } }),
    prisma.trip.findMany({ select: { status: true } }),
    prisma.vehicleDocument.findMany({ select: { expiresAt: true } }),
    prisma.maintenanceLog.findMany({ where: { isOpen: true }, select: { id: true } }),
  ]);

  const activeVehicles = vehicles.filter((vehicle: { status: string }) => vehicle.status !== "RETIRED").length;
  const availableVehicles = vehicles.filter((vehicle: { status: string }) => vehicle.status === "AVAILABLE").length;
  const maintenanceVehicles = vehicles.filter((vehicle: { status: string }) => vehicle.status === "IN_SHOP").length;
  const activeTrips = trips.filter((trip: { status: string }) => trip.status === "DISPATCHED").length;
  const pendingTrips = trips.filter((trip: { status: string }) => trip.status === "DRAFT").length;
  const driversOnDuty = drivers.filter((driver: { status: string }) => driver.status === "ON_TRIP").length;
  const utilization = activeVehicles ? Math.round(((activeVehicles - availableVehicles) / activeVehicles) * 100) : 0;

  const docsExpiringSoon = documents.filter((document: { expiresAt: Date }) => document.expiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000).length;

  const kpis =
    role === "FINANCIAL_ANALYST"
      ? [
          ["Fleet Utilization", `${utilization}%`],
          ["Pending Trips", formatCount(pendingTrips)],
          ["Active Trips", formatCount(activeTrips)],
          ["Documents Near Expiry", formatCount(docsExpiringSoon)],
          ["Vehicles in Maintenance", formatCount(maintenanceVehicles)],
          ["Open Maintenance", formatCount(maintenance.length)],
        ]
      : role === "SAFETY_OFFICER"
        ? [
            ["Documents Near Expiry", formatCount(docsExpiringSoon)],
            ["Vehicles in Maintenance", formatCount(maintenanceVehicles)],
            ["Drivers On Duty", formatCount(driversOnDuty)],
            ["Active Trips", formatCount(activeTrips)],
            ["Available Vehicles", formatCount(availableVehicles)],
            ["Fleet Utilization", `${utilization}%`],
          ]
        : [
            ["Available Vehicles", formatCount(availableVehicles)],
            ["Active Vehicles", formatCount(activeVehicles)],
            ["Vehicles in Maintenance", formatCount(maintenanceVehicles)],
            ["Active Trips", formatCount(activeTrips)],
            ["Pending Trips", formatCount(pendingTrips)],
            ["Drivers On Duty", formatCount(driversOnDuty)],
            ["Fleet Utilization", `${utilization}%`],
          ];

  return (
    <AppShell>
      <section className="space-y-6">
        <div>
          <h1 className="text-[32px] font-semibold leading-[1.2]">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">Role-aware operations view with live counts, compliance signals, and dispatch readiness.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map(([label, value]) => (
          <Card key={label} className="p-6">
            <p className="text-[32px] font-semibold leading-[1.2] tabular-nums">{value}</p>
            <p className="text-[13px] text-[var(--color-text-muted)]">{label}</p>
          </Card>
        ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-[16px] font-medium">Utilization trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="util" stroke="var(--color-primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="mb-2 text-[16px] font-medium">Operational cost index</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="var(--color-warning)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        </div>
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-medium">Fleet snapshot</h3>
            <Badge tone={docsExpiringSoon > 0 ? "warning" : "success"}>{docsExpiringSoon > 0 ? "Review documents" : "All clear"}</Badge>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">Vehicles</p>
              <p className="mt-1 text-[22px] font-semibold tabular-nums">{formatCount(activeVehicles)}</p>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">Trips</p>
              <p className="mt-1 text-[22px] font-semibold tabular-nums">{formatCount(activeTrips + pendingTrips)}</p>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">Maintenance</p>
              <p className="mt-1 text-[22px] font-semibold tabular-nums">{formatCount(maintenance.length)}</p>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
