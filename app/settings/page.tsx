import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionUser } from "@/lib/auth/session";
import { RoleMatrixButton } from "@/components/settings/role-matrix";
import { LogoutButton } from "@/components/settings/logout-button";
import { AdvancedSettingsCard } from "@/components/settings/advanced-settings";
import { User, Mail, Shield } from "lucide-react";

export default async function Page() {
  const user = await getSessionUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Settings</h2>
          <p className="mt-1.5 text-[14px] text-[var(--color-text-muted)]">Manage your account profile and view application roles.</p>
        </div>

        {/* Profile Details Card - Visible to all logged-in users */}
        {user && (
          <Card>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-[16px] font-medium text-[var(--color-text-primary)]">Your Profile</h3>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">Details of the currently active session.</p>
              </div>

              <div className="my-1 border-t border-[var(--color-border-soft)]" />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--color-text-muted)]">Full Name</p>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--color-text-muted)]">Email Address</p>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--color-text-muted)]">Access Role</p>
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                      {user.role.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-1 border-t border-[var(--color-border-soft)]" />

              <div className="flex items-center gap-3">
                <RoleMatrixButton />
              </div>
            </div>
          </Card>
        )}

        {/* Advanced settings for Admin only */}
        {isAdmin ? (
          <AdvancedSettingsCard />
        ) : (
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-medium text-[var(--color-text-primary)]">Advanced settings</h3>
                <p className="mt-1 text-[14px] text-[var(--color-text-subtle)]">Administrative configurations are hidden for your role. Contact an administrator to adjust optimization weights or system thresholds.</p>
              </div>
              <Badge tone="warning">Restricted</Badge>
            </div>
          </Card>
        )}

        {/* Sign Out */}
        {user && (
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-medium text-[var(--color-text-primary)]">Sign out</h3>
                <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">End your current session and return to the login page.</p>
              </div>
              <LogoutButton />
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
