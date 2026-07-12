"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-[13px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)]"
      >
        <Search size={14} />
        Cmd/Ctrl+K
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-[rgba(25,25,25,0.4)] p-4" onClick={() => setOpen(false)}>
          <Command className="mx-auto mt-20 w-full max-w-lg rounded-[12px] border border-[var(--color-border)] bg-[var(--color-background)] p-2 shadow-[0_1px_2px_rgba(25,25,25,0.04),0_2px_8px_rgba(25,25,25,0.03)]" onClick={(event) => event.stopPropagation()}>
            <Command.Input className="w-full rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[14px] outline-none" placeholder="Search commands" />
            <Command.List className="mt-2 max-h-72 overflow-auto">
              <Command.Empty className="px-3 py-4 text-[13px] text-[var(--color-text-muted)]">No matching command.</Command.Empty>
            {items.map((item) => (
              <Command.Item
                key={item.href}
                onSelect={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
                  className="cursor-pointer rounded-[8px] px-3 py-2 text-[14px] text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-surface-muted)] aria-selected:bg-[var(--color-surface-muted)]"
              >
                {item.label}
              </Command.Item>
            ))}
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}
