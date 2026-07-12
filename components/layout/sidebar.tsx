"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RoleName } from "@/lib/domain/enums";
import { Building2, Gauge, ShieldAlert, Truck, Users, WalletCards, Wrench, FileText, Settings, Bell } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/vehicles", label: "Vehicles", icon: Truck, permission: "vehicle" },
  { href: "/drivers", label: "Drivers", icon: Users, permission: "driver" },
  { href: "/trips", label: "Trips", icon: Building2 },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/fuel-expenses", label: "Fuel & Expenses", icon: WalletCards },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/reports", label: "Reports", icon: ShieldAlert },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

function visible(role: RoleName, item: (typeof items)[number]) {
  if (item.admin && role !== "ADMIN") return false;
  if (item.permission === "vehicle" && role === "FINANCIAL_ANALYST") return false;
  if (item.permission === "driver" && role === "FINANCIAL_ANALYST") return false;
  return true;
}

export function Sidebar({ role }: { role: RoleName }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h1 className="mb-6 text-[16px] font-medium text-[var(--color-text-primary)]">IronRoute</h1>
      <nav className="space-y-1">
        {items.filter((item) => visible(role, item)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-[8px] px-3 py-2 text-[14px] transition-colors ${pathname.startsWith(item.href) ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"}`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
