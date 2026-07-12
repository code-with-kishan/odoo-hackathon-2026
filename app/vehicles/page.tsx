import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function VehiclesPage() {
  return (
    <AppShell>
      <Card>
        <h2 className="text-[22px] font-semibold">Vehicles</h2>
        <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">CRUD APIs available at /api/vehicles with search, filter, sort support.</p>
        <div className="mt-4"><Badge tone="warning">No vehicles loaded in UI yet</Badge></div>
      </Card>
    </AppShell>
  );
}
