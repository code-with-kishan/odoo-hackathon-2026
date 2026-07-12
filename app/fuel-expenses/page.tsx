import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default async function Page() {
  return (
    <AppShell>
      <Card>
        <h2 className="text-[22px] font-semibold">fuel-expenses</h2>
        <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Designed empty state scaffold for fuel-expenses.</p>
      </Card>
    </AppShell>
  );
}
