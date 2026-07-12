import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function Page() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold">Settings</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Advanced controls stay hidden until explicitly opened.</p>
        </div>
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[16px] font-medium">Advanced optimization</h3>
              <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">Expose optimizer weights, anomaly thresholds, and notification windows only when needed.</p>
            </div>
            <Badge tone="warning">Hidden by default</Badge>
          </div>
          <div className="mt-4 flex gap-3">
            <Button>Enable advanced settings</Button>
            <Button variant="secondary">View role matrix</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
