"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("ironroute-theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const nextTheme = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("ironroute-theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)]"
    >
      {dark ? <SunMedium size={16} /> : <MoonStar size={16} />}
    </button>
  );
}