"use client";

import { Command } from "cmdk";
import { useState } from "react";
import { useRouter } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "Drivers", href: "/drivers" },
  { label: "Trips", href: "/trips" },
  { label: "Create Trip", href: "/trips?new=true" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button onClick={() => setOpen((v) => !v)} className="rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[13px] text-[var(--color-text-muted)]">
        Cmd/Ctrl+K
      </button>
      {open ? (
        <Command className="absolute right-4 top-16 w-80 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-background)] p-2">
          <Command.Input className="w-full rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[14px]" placeholder="Search commands" />
          <Command.List>
            {items.map((item) => (
              <Command.Item
                key={item.href}
                onSelect={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
                className="cursor-pointer rounded-[8px] px-3 py-2 text-[14px] hover:bg-[var(--color-surface-muted)]"
              >
                {item.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      ) : null}
    </>
  );
}
