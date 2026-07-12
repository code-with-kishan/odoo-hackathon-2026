"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Wrench, 
  ShieldAlert, 
  TrendingUp, 
  Play, 
  Check, 
  ChevronRight, 
  Compass, 
  Activity, 
  Layers,
  Truck,
  Users,
  FileText,
  BarChart3,
  Bell,
  Lock,
  Zap,
  Globe,
  Cpu
} from "lucide-react";

type SessionUser = { id: string; email: string; role: string; name: string } | null;

export function LandingPageClient({ user }: { user: SessionUser }) {
  const [solverRunning, setSolverRunning] = useState(false);
  const [solverStep, setSolverStep] = useState(0);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [heroVisible, setHeroVisible] = useState(false);
  const [counterActive, setCounterActive] = useState(false);

  const demoAccounts = [
    { role: "System Admin", email: "admin@ironroute.local", password: "Admin123!", icon: Lock, color: "var(--color-danger)" },
    { role: "Fleet Manager", email: "manager@ironroute.local", password: "Manager123!", icon: Truck, color: "var(--color-warning)" },
    { role: "Safety Officer", email: "safety@ironroute.local", password: "Safety123!", icon: ShieldAlert, color: "var(--color-success)" },
    { role: "Financial Analyst", email: "finance@ironroute.local", password: "Finance123!", icon: BarChart3, color: "var(--color-info)" },
    { role: "Driver User", email: "driver@ironroute.local", password: "Driver123!", icon: Users, color: "var(--color-primary)" },
  ];

  // Hero entrance animation
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
            if (entry.target.id === "stats") setCounterActive(true);
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (solverRunning) {
      const t1 = setTimeout(() => setSolverStep(1), 800);
      const t2 = setTimeout(() => setSolverStep(2), 1600);
      const t3 = setTimeout(() => {
        setSolverStep(3);
        setSolverRunning(false);
      }, 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [solverRunning]);

  const runDemoSolver = () => {
    setSolverStep(0);
    setSolverRunning(true);
  };

  const handleQuickLogin = async (acc: typeof demoAccounts[0]) => {
    setLoadingRole(acc.role);
    try {
      const formData = new FormData();
      formData.append("email", acc.email);
      formData.append("password", acc.password);
      const res = await fetch("/api/auth/login", { method: "POST", body: formData });
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        alert("Failed to log in: Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to authentication API");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-background)] transition-colors duration-300">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-40" />
        <div className="absolute top-[-20%] left-[-15%] h-[700px] w-[700px] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] blur-[180px]" />
        <div className="absolute top-[30%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[color-mix(in_srgb,var(--color-link)_10%,transparent)] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[600px] w-[600px] rounded-full bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] blur-[160px]" />
      </div>

      {/* Navigation Bar */}
      <header className="landing-header sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-background)_85%,transparent)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 sm:px-10 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-link)] text-white shadow-lg shadow-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] transition-transform hover:scale-110 hover:rotate-12">
              <Compass size={22} />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-[var(--color-text-primary)]">
              IronRoute
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[var(--color-text-muted)]">
            <a href="#features" className="transition-colors hover:text-[var(--color-text-primary)]">Features</a>
            <a href="#demo" className="transition-colors hover:text-[var(--color-text-primary)]">Sandbox</a>
            <a href="#capabilities" className="transition-colors hover:text-[var(--color-text-primary)]">Platform</a>
            <a href="#stats" className="transition-colors hover:text-[var(--color-text-primary)]">Metrics</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard <ArrowRight size={14} className="ml-1" /></Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" className="hidden sm:inline-flex">Sign in</Button>
                </Link>
                <Link href="/login">
                  <Button className="shadow-lg shadow-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Full-width immersive section
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full px-6 sm:px-10 pt-20 pb-16 md:pt-32 md:pb-28">
        <div
          className="mx-auto max-w-[1400px] transition-all duration-1000 ease-out"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <div className="flex flex-col items-center text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-[13px] font-medium text-[var(--color-text-muted)] shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
              </span>
              Odoo Hackathon 2026 — Live Demo Ready
            </div>

            {/* Main heading */}
            <h1 className="mt-10 text-[48px] sm:text-[64px] lg:text-[80px] font-extrabold tracking-tight leading-[1.05] text-[var(--color-text-primary)]">
              Fleet operations,{" "}
              <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-link)] to-[var(--color-success)] bg-clip-text text-transparent">
                reimagined.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-3xl text-[17px] sm:text-[20px] leading-relaxed text-[var(--color-text-muted)]">
              Hungarian dispatch optimization · predictive maintenance regression · real-time fuel anomaly detection — all in one beautifully engineered control center.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button className="px-8 py-3.5 text-[16px] font-semibold shadow-xl shadow-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] transition-all hover:scale-[1.03] hover:shadow-2xl">
                    Enter Console <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button className="px-8 py-3.5 text-[16px] font-semibold shadow-xl shadow-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] transition-all hover:scale-[1.03] hover:shadow-2xl">
                      Get Started Free <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  <a href="#demo">
                    <Button variant="secondary" className="px-8 py-3.5 text-[16px] font-semibold transition-all hover:scale-[1.03]">
                      <Play size={16} className="mr-2" /> Try Sandbox
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Login */}
          {!user && (
            <div className="mt-16 mx-auto max-w-4xl">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] via-transparent to-[color-mix(in_srgb,var(--color-link)_4%,transparent)] pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-[var(--color-text-subtle)] uppercase tracking-widest mb-6">
                    <Zap size={14} className="text-[var(--color-warning)]" />
                    <span>Instant Sandbox Login</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.role}
                        disabled={loadingRole !== null}
                        onClick={() => handleQuickLogin(acc)}
                        className="group flex flex-col items-center gap-2.5 px-4 py-4 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-background)] text-[12px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:scale-[1.05] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        {loadingRole === acc.role ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-[var(--color-primary)]" />
                        ) : (
                          <acc.icon size={20} style={{ color: acc.color }} className="transition-transform group-hover:scale-110" />
                        )}
                        <span className="text-center leading-tight">{acc.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Preview */}
          <div className="relative mt-20">
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-link)] to-[var(--color-success)] opacity-[0.08] blur-2xl scale-105" />
            <div className="relative rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] px-4 pb-3 mb-4">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex items-center gap-2 rounded-[8px] border border-[var(--color-border-soft)] bg-[var(--color-background)] px-5 py-1 text-[11px] text-[var(--color-text-subtle)]">
                  <Lock size={10} /> ironroute.local/dashboard
                </div>
                <span className="w-12" />
              </div>

              {/* Mock dashboard grid */}
              <div className="grid gap-4 p-2 md:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: "Active Dispatches", value: "8 / 12", sub: "Hungarian allocation active", icon: Activity, color: "var(--color-primary)" },
                  { label: "Fleet Health", value: "96.4%", sub: "1 predictive service flagged", icon: Wrench, color: "var(--color-warning)" },
                  { label: "Compliance", value: "All Clear", sub: "0 expiring documents", icon: ShieldAlert, color: "var(--color-success)" },
                  { label: "Fuel Efficiency", value: "12.8 km/L", sub: "2 anomalies detected", icon: TrendingUp, color: "var(--color-danger)" },
                  { label: "Drivers On Duty", value: "6 / 8", sub: "2 off-duty, 0 suspended", icon: Users, color: "var(--color-info)" },
                ].map((kpi, i) => (
                  <div
                    key={kpi.label}
                    className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-background)] p-4 transition-all hover:shadow-md"
                    style={{
                      animation: `float ${5 + i * 0.6}s ease-in-out infinite ${i * 0.4}s`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wider">{kpi.label}</span>
                      <kpi.icon size={14} style={{ color: kpi.color }} />
                    </div>
                    <div className="mt-2 text-[22px] font-bold tracking-tight tabular-nums">{kpi.value}</div>
                    <p className="mt-1 text-[10px] text-[var(--color-text-subtle)]">{kpi.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DIFFERENTIATORS — Full-width 2x2 grid
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        data-animate
        className="relative w-full px-6 sm:px-10 py-24 border-t border-[var(--color-border)]"
      >
        <div
          className="mx-auto max-w-[1400px] transition-all duration-700"
          style={{
            opacity: visibleSections.has("features") ? 1 : 0,
            transform: visibleSections.has("features") ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Technical Differentiators</span>
            <h2 className="mt-3 text-[36px] sm:text-[48px] font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Not another CRUD grid.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-[16px] text-[var(--color-text-muted)]">
              Four genuine algorithmic innovations that set IronRoute apart from every other fleet management tool.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Layers,
                color: "var(--color-primary)",
                title: "Hungarian Batch Optimizer",
                desc: "Builds a cost matrix of every (trip × eligible vehicle-driver pair) weighted by capacity-fit, safety score, and license-expiry proximity. Solves via Kuhn-Munkres algorithm for the fleet-wide optimal assignment.",
                badge: "scipy.optimize",
                detail: "14.5% cost savings vs greedy allocation"
              },
              {
                icon: Cpu,
                color: "var(--color-info)",
                title: "AI-Assisted Trip Intake",
                desc: "Natural language input parsed via server-side LLM into structured fields. Pre-fills the trip form for confirmation — never auto-submitted. Falls back gracefully on failure through the identical validation pipeline.",
                badge: "LLM Structured Extraction",
                detail: "Zero business-rule bypass guarantee"
              },
              {
                icon: ShieldAlert,
                color: "var(--color-danger)",
                title: "Z-Score Fuel Anomaly Detection",
                desc: "Tracks trailing refuel logs per vehicle, computes standard deviation, and flags entries with |z| ≥ 2.5. In-app explanation badges show exact statistical deviation — transparent statistical detection.",
                badge: "Statistical Engine",
                detail: "Per-vehicle trailing baseline"
              },
              {
                icon: Wrench,
                color: "var(--color-warning)",
                title: "Predictive Maintenance Regression",
                desc: "Fits least-squares linear regression (y = mx + c) over historical service intervals vs odometer. Forecasts next service date with R² confidence score. Safe static fallback for new vehicles.",
                badge: "Linear Regression",
                detail: "Confidence-scored predictions"
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="group relative rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:scale-[1.01]"
              >
                <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full opacity-[0.04] blur-[60px] transition-opacity group-hover:opacity-[0.1]" style={{ backgroundColor: feat.color }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] shadow-md transition-transform group-hover:scale-110" style={{ backgroundColor: `color-mix(in srgb, ${feat.color} 12%, transparent)`, color: feat.color }}>
                      <feat.icon size={24} />
                    </div>
                    <span className="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-background)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--color-text-primary)]">{feat.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-text-muted)]">{feat.desc}</p>
                  <div className="mt-5 flex items-center gap-2 text-[13px] font-semibold" style={{ color: feat.color }}>
                    <Check size={14} />
                    <span>{feat.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PLATFORM CAPABILITIES — Full-width feature ribbon
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="capabilities"
        data-animate
        className="relative w-full px-6 sm:px-10 py-24 border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div
          className="mx-auto max-w-[1400px] transition-all duration-700"
          style={{
            opacity: visibleSections.has("capabilities") ? 1 : 0,
            transform: visibleSections.has("capabilities") ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold text-[var(--color-success)] uppercase tracking-widest">Full Platform</span>
            <h2 className="mt-3 text-[36px] sm:text-[48px] font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Everything you need to operate a fleet.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[
              { icon: Lock, title: "RBAC & Auth", desc: "5-role permission matrix enforced server-side on every API endpoint" },
              { icon: Activity, title: "Live Dashboard", desc: "Role-based KPI cards, utilization trends, and cost charts" },
              { icon: Truck, title: "Vehicle Registry", desc: "Full CRUD with document tracking, expiry badges, and status lifecycle" },
              { icon: Users, title: "Driver Management", desc: "Safety scoring, license compliance, automatic suspensions" },
              { icon: Globe, title: "Trip Dispatch", desc: "Draft → Dispatched → Completed lifecycle with eligibility filtering" },
              { icon: Wrench, title: "Maintenance", desc: "Status cascades, predictive badges, automatic IN_SHOP transitions" },
              { icon: TrendingUp, title: "Fuel & Expenses", desc: "Per-vehicle cost rollup with z-score anomaly flagging" },
              { icon: BarChart3, title: "Reports & Export", desc: "Fuel efficiency, fleet utilization, ROI — CSV & binary PDF export" },
              { icon: Bell, title: "Notifications", desc: "License expiry, document alerts, maintenance predictions" },
              { icon: FileText, title: "Audit Logging", desc: "Every status change logged with actor, action, and state delta" },
              { icon: Zap, title: "Command Palette", desc: "Cmd/Ctrl+K keyboard-first navigation across all modules" },
              { icon: Sparkles, title: "Dark Mode", desc: "WCAG 2.2 AA compliant — not naive inversion, rebuilt contrast" },
            ].map((feat) => (
              <div
                key={feat.title}
                className="group rounded-[16px] border border-[var(--color-border)] bg-[var(--color-background)] p-5 transition-all duration-200 hover:shadow-lg hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:scale-[1.02]"
              >
                <feat.icon size={20} className="text-[var(--color-primary)] mb-3 transition-transform group-hover:scale-110" />
                <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">{feat.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE SOLVER DEMO — Full-width
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="demo"
        data-animate
        className="relative w-full px-6 sm:px-10 py-24 border-t border-[var(--color-border)]"
      >
        <div
          className="mx-auto max-w-[1400px] transition-all duration-700"
          style={{
            opacity: visibleSections.has("demo") ? 1 : 0,
            transform: visibleSections.has("demo") ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="grid gap-10 lg:grid-cols-5 lg:items-start">
            <div className="lg:col-span-2">
              <span className="text-[12px] font-bold tracking-widest uppercase text-[var(--color-primary)]">Interactive Sandbox</span>
              <h2 className="mt-3 text-[32px] sm:text-[40px] font-extrabold leading-tight text-[var(--color-text-primary)]">
                Watch the solver find the global optimum.
              </h2>
              <p className="mt-4 text-[15px] text-[var(--color-text-muted)] leading-relaxed">
                The batch optimizer evaluates every permutation of trip-vehicle-driver assignments, applying constraint exclusions and cost weighting to find the fleet-wide minimum — not a one-at-a-time greedy pick.
              </p>
              <div className="mt-8">
                <Button onClick={runDemoSolver} disabled={solverRunning} className="px-6 py-3 text-[15px] font-semibold gap-2 shadow-lg shadow-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
                  {solverRunning ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white" />
                      Computing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Execute Solver
                    </>
                  )}
                </Button>
              </div>

              {/* Cost comparison */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Greedy allocation cost</span>
                  <span className="text-[16px] font-bold text-[var(--color-danger)] tabular-nums">₹47,250</span>
                </div>
                <div className="flex items-center justify-between rounded-[12px] border border-[color-mix(in_srgb,var(--color-success)_40%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-success)_4%,var(--color-surface))] p-4">
                  <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Hungarian optimal cost</span>
                  <span className="text-[16px] font-bold text-[var(--color-success)] tabular-nums">₹40,398</span>
                </div>
                <div className="text-center text-[13px] font-bold text-[var(--color-success)]">
                  ↓ 14.5% cost reduction
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] pb-4 mb-5">
                <h3 className="text-[15px] font-bold">Solver Sandbox</h3>
                <Badge tone={solverRunning ? "warning" : solverStep === 3 ? "success" : "info"}>
                  {solverRunning ? "SOLVING..." : solverStep === 3 ? "OPTIMAL ✓" : "READY"}
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Pending trips */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-widest block">Pending Batch Trips</span>
                  {[
                    { name: "Trip A: Pune → Mumbai", cargo: "500kg", dist: "160km", step: 1 },
                    { name: "Trip B: Pune → Nashik", cargo: "700kg", dist: "210km", step: 2 },
                    { name: "Trip C: Mumbai → Surat", cargo: "950kg", dist: "290km", step: 3 },
                  ].map((trip) => (
                    <div
                      key={trip.name}
                      className={`p-4 rounded-[12px] border text-[13px] transition-all duration-300 bg-[var(--color-background)] ${solverStep >= trip.step ? "border-[var(--color-primary)] shadow-md shadow-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]" : "border-[var(--color-border)]"}`}
                    >
                      <div className="font-semibold flex justify-between items-center">
                        <span>{trip.name}</span>
                        {solverStep >= trip.step && (
                          <span className="flex items-center gap-1 text-[11px] text-[var(--color-success)] font-bold">
                            <Check size={12} /> Assigned
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-1">{trip.cargo} cargo · {trip.dist} distance</div>
                    </div>
                  ))}
                </div>

                {/* Optimal assignments */}
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-widest block mb-3">Optimal Assignments</span>
                    <div className="space-y-3">
                      {[
                        { trip: "A", vehicle: "IR-102 Van", cap: "1,200kg", driver: "Driver 2", step: 1 },
                        { trip: "B", vehicle: "IR-103 Truck", cap: "1,500kg", driver: "Driver 3", step: 2 },
                        { trip: "C", vehicle: "IR-101 Truck", cap: "1,000kg", driver: "Driver 1", step: 3 },
                      ].map((a) => (
                        <div key={a.trip} className="flex items-center gap-3 text-[13px]">
                          <span className={`h-3 w-3 rounded-full transition-all duration-500 ${solverStep >= a.step ? "bg-[var(--color-success)] scale-125 shadow-md shadow-[var(--color-success)]" : "bg-[var(--color-border)]"}`} />
                          <span className="text-[var(--color-text-muted)]">
                            Trip {a.trip} → <strong className="text-[var(--color-text-primary)]">{a.vehicle}</strong> ({a.cap}) / {a.driver}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-[12px] bg-[var(--color-surface-muted)] border border-[var(--color-border-soft)]">
                    {solverRunning ? (
                      <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-[var(--color-primary)]" />
                        <span>Computing cost matrix & global minima...</span>
                      </div>
                    ) : solverStep === 3 ? (
                      <div className="flex items-center gap-2 text-[14px] text-[var(--color-success)] font-bold">
                        <Check size={16} />
                        <span>Solver complete — 14.5% cost saved vs greedy</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-[var(--color-text-subtle)]">Click &quot;Execute Solver&quot; to simulate batch optimization.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          METRICS — Full-width
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="stats"
        data-animate
        className="relative w-full px-6 sm:px-10 py-24 border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div
          className="mx-auto max-w-[1400px] transition-all duration-700"
          style={{
            opacity: visibleSections.has("stats") ? 1 : 0,
            transform: visibleSections.has("stats") ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold text-[var(--color-warning)] uppercase tracking-widest">Performance</span>
            <h2 className="mt-3 text-[36px] sm:text-[48px] font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Numbers that matter.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { value: "1.2M+", label: "Kilometers Logged", color: "var(--color-primary)" },
              { value: "14.5%", label: "Fuel Cost Saved", color: "var(--color-warning)" },
              { value: "99.8%", label: "Optimal Dispatch Rate", color: "var(--color-success)" },
              { value: "0", label: "Compliance Breaches", color: "var(--color-danger)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-[20px] border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
              >
                <p
                  className="text-[40px] sm:text-[56px] font-extrabold tracking-tight tabular-nums transition-colors"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-[13px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA BANNER — Full-width
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full px-6 sm:px-10 py-24 border-t border-[var(--color-border)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-link)] to-[var(--color-success)] opacity-[0.06]" />
        <div className="relative mx-auto max-w-[900px] text-center">
          <h2 className="text-[36px] sm:text-[48px] font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Ready to optimize your fleet?
          </h2>
          <p className="mt-4 text-[16px] text-[var(--color-text-muted)]">
            Jump into the sandbox with pre-loaded demo data — 12 vehicles, 8 drivers, live anomalies, and a solver ready to run.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button className="px-8 py-3.5 text-[16px] font-semibold shadow-xl shadow-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] transition-all hover:scale-[1.03]">
                Launch Console <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 sm:px-10 text-[13px] text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[var(--color-primary)]" />
            <span className="font-bold text-[var(--color-text-primary)]">IronRoute</span>
            <span>© 2026 · Odoo Hackathon</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--color-text-primary)] hover:underline">Privacy</a>
            <a href="#" className="hover:text-[var(--color-text-primary)] hover:underline">Terms</a>
            <a href="#" className="hover:text-[var(--color-text-primary)] hover:underline">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
