import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default async function DriversPage() {
  return (
    <AppShell>
      <Card>
        <h2 className="text-[22px] font-semibold">Drivers</h2>
        <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">CRUD APIs available at /api/drivers with search/filter/sort and license compliance fields.</p>
      </Card>
    </AppShell>
  );
}
