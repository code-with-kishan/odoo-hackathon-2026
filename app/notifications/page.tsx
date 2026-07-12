import { AppShell } from "@/components/layout/app-shell";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-[var(--color-primary)]" />
          <div>
            <h2 className="text-[22px] font-semibold">Notifications</h2>
            <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
              License expiry, document expiry, and predictive maintenance reminders. Run a scan to generate new alerts.
            </p>
          </div>
        </div>
        <NotificationCenter />
      </div>
    </AppShell>
  );
}
