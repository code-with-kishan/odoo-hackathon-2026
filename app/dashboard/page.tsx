import { Card } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", util: 62, cost: 12 },
  { month: "Feb", util: 68, cost: 11 },
  { month: "Mar", util: 71, cost: 14 },
  { month: "Apr", util: 75, cost: 13 },
];

export default function DashboardPage() {
  const kpis = [
    ["Active Vehicles", "12"],
    ["Available Vehicles", "7"],
    ["Vehicles in Maintenance", "1"],
    ["Active Trips", "3"],
    ["Pending Trips", "2"],
    ["Drivers On Duty", "6"],
    ["Fleet Utilization", "75%"],
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <LineChart data={data}>
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
              <BarChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="var(--color-warning)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </section>
  );
}
