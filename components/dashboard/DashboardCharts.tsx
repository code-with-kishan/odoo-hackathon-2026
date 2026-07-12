"use client";

import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const trendData = [
  { month: "Jan", util: 62, cost: 12 },
  { month: "Feb", util: 68, cost: 11 },
  { month: "Mar", util: 71, cost: 14 },
  { month: "Apr", util: 75, cost: 13 },
];

export function DashboardCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-2 text-[16px] font-medium">Utilization trend</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="month" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
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
              <XAxis dataKey="month" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip />
              <Bar dataKey="cost" fill="var(--color-warning)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
