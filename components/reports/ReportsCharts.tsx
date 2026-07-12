"use client";

import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

const PIE_COLORS = ["#2383E2", "#E8A33D", "#2F9E44", "#E0393E"];

export function ReportsCharts({
  costDonut,
  fuelData,
}: {
  costDonut: Array<{ name: string; value: number }>;
  fuelData: Array<{ name: string; fuel: number }>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-2 text-[16px] font-medium">Cost breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costDonut}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
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
            <BarChart data={fuelData}>
              <XAxis dataKey="name" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip />
              <Bar dataKey="fuel" fill="var(--color-warning)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
