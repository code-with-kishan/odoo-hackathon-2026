import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TripsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <h2 className="text-[22px] font-semibold">Trips</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Lifecycle: Draft → Dispatched → Completed/Cancelled enforced server-side.</p>
          <Button className="mt-4">Create Trip</Button>
        </Card>
      </div>
    </AppShell>
  );
}
