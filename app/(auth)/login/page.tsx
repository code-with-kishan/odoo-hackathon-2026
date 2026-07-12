"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Compass, Mail, Lock, ArrowLeft, Key, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const demoAccounts = [
    { role: "Admin", email: "admin@ironroute.local", password: "Admin123!" },
    { role: "Fleet Manager", email: "manager@ironroute.local", password: "Manager123!" },
    { role: "Safety Officer", email: "safety@ironroute.local", password: "Safety123!" },
    { role: "Finance Analyst", email: "finance@ironroute.local", password: "Finance123!" },
    { role: "Driver", email: "driver@ironroute.local", password: "Driver123!" },
  ];

  const selectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--color-background)] transition-colors duration-300">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] blur-[120px] pointer-events-none" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[440px]">
        {/* Back Link */}
        <Link 
          href="/" 
          className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={14} /> Back to homepage
        </Link>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)] relative overflow-hidden">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-primary)] text-white shadow-md mb-4">
              <Compass size={24} className="animate-spin-slow" />
            </div>
            <h1 className="text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">Sign in</h1>
            <p className="mt-1.5 text-[13px] text-[var(--color-text-muted)]">Enter credentials or select a demo role below</p>
          </div>

          <form className="mt-6 space-y-4" action="/api/auth/login" method="post">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[var(--color-text-subtle)]">
                <Mail size={16} />
              </span>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-10 pr-4 text-[14px] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[var(--color-text-subtle)]">
                <Lock size={16} />
              </span>
              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-10 pr-4 text-[14px] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-text-primary)]"
              />
            </div>

            <Button type="submit" className="w-full py-2.5 shadow-md shadow-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
              Sign in to console
            </Button>
          </form>

          {/* Quick-fill section */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border-soft)]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">
              <Key size={12} className="text-[var(--color-primary)]" />
              <span>Select Demo Account to Pre-fill</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => selectDemoAccount(acc)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-[12px] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)] transition-all cursor-pointer hover:scale-[1.03]"
                >
                  <Sparkles size={11} className="text-[var(--color-primary)]" />
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
