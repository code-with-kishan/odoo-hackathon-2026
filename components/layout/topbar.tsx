import { Bell } from "lucide-react";
import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { RoleName } from "@/lib/domain/enums";

export function Topbar({ role }: { role: RoleName }) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)] px-6 py-4">
      <div>
        <p className="text-[12px] font-medium text-[var(--color-text-subtle)]">Fleet Operations</p>
        <h2 className="text-[16px] font-medium text-[var(--color-text-primary)]">Role: {role.replaceAll("_", " ")}</h2>
      </div>
      <div className="flex items-center gap-3">
        <CommandPalette />
        <ThemeToggle />
        <button aria-label="Notifications" className="rounded-[8px] border border-[var(--color-border)] p-2">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
