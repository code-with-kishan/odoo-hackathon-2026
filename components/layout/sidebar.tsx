import Link from "next/link";
import { RoleName } from "@prisma/client";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vehicles", label: "Vehicles", permission: "vehicle" },
  { href: "/drivers", label: "Drivers", permission: "driver" },
  { href: "/trips", label: "Trips" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/fuel-expenses", label: "Fuel & Expenses" },
  { href: "/documents", label: "Documents" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings", admin: true },
];

function visible(role: RoleName, item: (typeof items)[number]) {
  if (item.admin && role !== "ADMIN") return false;
  if (item.permission === "vehicle" && role === "FINANCIAL_ANALYST") return false;
  if (item.permission === "driver" && role === "FINANCIAL_ANALYST") return false;
  return true;
}

export function Sidebar({ role }: { role: RoleName }) {
  return (
    <aside className="sticky top-0 h-screen w-[240px] border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h1 className="mb-6 text-[16px] font-medium text-[var(--color-text-primary)]">IronRoute</h1>
      <nav className="space-y-1">
        {items.filter((item) => visible(role, item)).map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-[8px] px-3 py-2 text-[14px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
