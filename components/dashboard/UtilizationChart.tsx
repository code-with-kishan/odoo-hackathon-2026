"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function UtilizationChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div style={{ height: 200 }} className="mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="var(--color-text-muted)" />
          <YAxis stroke="var(--color-text-muted)" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
