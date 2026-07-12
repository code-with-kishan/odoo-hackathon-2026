"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";

export function UserMenu({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer overflow-hidden"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--color-primary)] font-semibold text-white text-[12px]">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[220px] rounded-[12px] border border-[var(--color-border)] bg-[var(--color-background)] p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          <div className="px-3 py-2">
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{user.name}</p>
            <p className="text-[12px] text-[var(--color-text-muted)] truncate">{user.email}</p>
            <span className="mt-1.5 inline-block rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-wider">
              {user.role.replaceAll("_", " ")}
            </span>
          </div>

          <div className="my-1.5 border-t border-[var(--color-border-soft)]" />

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[14px] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            <Settings size={15} className="text-[var(--color-text-muted)]" />
            <span>Settings</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[14px] text-[var(--color-danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
