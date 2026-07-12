"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Vehicle = { id: string; registrationNumber: string; nameModel: string; maxLoadCapacityKg: number; status: string };
type Driver = { id: string; name: string; licenseCategory: string; licenseExpiryDate: string; safetyScore: number; status: string };

type IntakeResult =
  | { ok: true; confidence: number; data: { source: string; destination: string; cargoWeightKg: number; plannedDistanceKm: number } }
  | { ok: false; reason: string; fallbackToManual: true };

type CompareResult = {
  message?: string;
  trips: Array<{ id: string; route: string; cargo: number }>;
  pairs: Array<{ vehicleId: string; vehicle: string; driverId: string; driver: string }>;
  optimal: Array<{ tripId: string; vehicleId: string; driverId: string; cost: number }>;
  greedy: Array<{ tripId: string; vehicleId: string; driverId: string; cost: number }>;
  optimalCost: number;
  greedyCost: number;
};

export function TripCreateForm({
  vehicles,
  drivers,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const eligibleVehicles = vehicles.filter((v) => v.status === "AVAILABLE");
  const eligibleDrivers = drivers.filter((d) => d.status === "AVAILABLE" && new Date(d.licenseExpiryDate) > new Date());

  const [nl, setNl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    source: "",
    destination: "",
    cargoWeightKg: "",
    plannedDistanceKm: "",
    vehicleId: "",
    driverId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Phase 5 comparison state
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const [comparing, setComparing] = useState(false);

  async function runIntake() {
    if (!nl.trim()) return;
    setParsing(true);
    setFallbackMsg(null);
    try {
      const res = await fetch("/api/trips/ai-intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: nl }),
      });
      const result = (await res.json()) as IntakeResult;
      if (result.ok) {
        setForm((f) => ({
          ...f,
          source: result.data.source,
          destination: result.data.destination,
          cargoWeightKg: String(result.data.cargoWeightKg),
          plannedDistanceKm: String(result.data.plannedDistanceKm),
        }));
        push("success", `AI parsed with ${(result.confidence * 100).toFixed(0)}% confidence — please confirm.`);
      } else {
        // Explicit fallback path (Phase 5 acceptance: must be tested).
        setFallbackMsg(result.reason);
        push("warning", result.reason);
      }
    } catch {
      setFallbackMsg("AI timeout/failure. Switched to manual mode.");
      push("warning", "AI intake failed — manual form enabled.");
    } finally {
      setParsing(false);
    }
  }

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors([]);
  }

  // Inline client validation mirrors the server pipeline (rule 10) for instant,
  // specific feedback ("Cargo weight exceeds this vehicle's 500kg capacity").
  function validate(): string[] {
    const errs: string[] = [];
    if (!form.source.trim()) errs.push("Source is required.");
    if (!form.destination.trim()) errs.push("Destination is required.");
    const cargo = Number(form.cargoWeightKg);
    const dist = Number(form.plannedDistanceKm);
    if (!form.cargoWeightKg || cargo <= 0) errs.push("Cargo weight must be greater than zero.");
    if (!form.plannedDistanceKm || dist <= 0) errs.push("Planned distance must be greater than zero.");
    if (form.vehicleId && cargo > 0) {
      const v = vehicles.find((x) => x.id === form.vehicleId);
      if (v && cargo > v.maxLoadCapacityKg) {
        errs.push(`Cargo weight exceeds this vehicle's ${v.maxLoadCapacityKg}kg capacity.`);
      }
    }
    return errs;
  }

  async function submit(asDispatch: boolean) {
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: form.source,
          destination: form.destination,
          cargoWeightKg: Number(form.cargoWeightKg),
          plannedDistanceKm: Number(form.plannedDistanceKm),
          vehicleId: form.vehicleId || null,
          driverId: form.driverId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = Array.isArray(data.issues) ? data.issues.join(" ") : data.error ?? "Failed to create trip.";
        push("danger", msg);
        setSubmitting(false);
        return;
      }
      const created = await res.json();
      if (asDispatch && created.id) {
        await fetch("/api/trips", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "dispatch", tripId: created.id }),
        });
        push("success", "Trip dispatched — vehicle & driver now On Trip.");
      } else {
        push("success", "Trip saved as draft.");
      }
      setForm({ source: "", destination: "", cargoWeightKg: "", plannedDistanceKm: "", vehicleId: "", driverId: "" });
      setNl("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function runCompare() {
    setComparing(true);
    try {
      const res = await fetch("/api/trips/optimize-compare", { method: "POST" });
      const data = (await res.json()) as CompareResult;
      setCompare(data);
      if (data.message) push("info", data.message);
      else push("success", "Optimizer comparison ready — see staged scenario.");
    } finally {
      setComparing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* AI intake */}
      <Card>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--color-primary)]" />
          <h3 className="text-[16px] font-medium">AI-assisted intake</h3>
          <Badge tone="info">Claude API · server-side</Badge>
        </div>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
          Describe the trip in plain language. The parsed result pre-fills the form for confirmation — never auto-submitted.
          On low confidence or failure it falls back to manual entry.
        </p>
        <textarea
          value={nl}
          onChange={(e) => setNl(e.target.value)}
          rows={2}
          placeholder="e.g. Move 450kg of cargo from Pune to Mumbai, ~160km, needs an HMV driver."
          className="mt-3 w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <Button onClick={runIntake} disabled={parsing || !nl.trim()}>
            {parsing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Parse with AI
          </Button>
          <button 
            type="button" 
            onClick={() => setNl("Move 450kg of cargo from Pune to Mumbai, ~160km")} 
            className="text-[12.5px] font-medium text-[var(--color-link)] hover:underline cursor-pointer"
          >
            Use demo query
          </button>
          {fallbackMsg && <span className="text-[13px] text-[var(--color-warning)]">{fallbackMsg}</span>}
        </div>
      </Card>

      {/* Manual form (shared validation pipeline, rule 10) */}
      <Card>
        <h3 className="text-[16px] font-medium">Trip details</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Source">
            <input value={form.source} onChange={(e) => set("source", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Destination">
            <input value={form.destination} onChange={(e) => set("destination", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Cargo weight (kg)">
            <input type="number" value={form.cargoWeightKg} onChange={(e) => set("cargoWeightKg", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Planned distance (km)">
            <input type="number" value={form.plannedDistanceKm} onChange={(e) => set("plannedDistanceKm", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Vehicle (available only)">
            <select value={form.vehicleId} onChange={(e) => set("vehicleId", e.target.value)} className={inputCls}>
              <option value="">Unassigned</option>
              {eligibleVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.nameModel} ({v.maxLoadCapacityKg}kg)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Driver (available only)">
            <select value={form.driverId} onChange={(e) => set("driverId", e.target.value)} className={inputCls}>
              <option value="">Unassigned</option>
              {eligibleDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.licenseCategory} (safety {d.safetyScore})
                </option>
              ))}
            </select>
          </Field>
        </div>

        {errors.length > 0 && (
          <ul className="mt-3 space-y-1 rounded-[8px] border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-3 text-[13px] text-[var(--color-danger)]">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => submit(false)} disabled={submitting}>
            Save as draft
          </Button>
          <Button variant="secondary" onClick={() => submit(true)} disabled={submitting}>
            Create & dispatch <ArrowRight size={14} />
          </Button>
        </div>
      </Card>

      {/* Phase 5: optimizer comparison view */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[16px] font-medium">Batch dispatch optimizer</h3>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              When ≥2 trips are pending, solve the fleet-wide optimal assignment (Hungarian) and compare to a greedy pick.
            </p>
          </div>
          <Button variant="secondary" onClick={runCompare} disabled={comparing}>
            {comparing ? <Loader2 size={14} className="animate-spin" /> : null}
            Run comparison
          </Button>
        </div>

        {compare && compare.trips.length >= 2 && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <CompareColumn title="Optimal (Hungarian)" tone="success" rows={compare} which="optimal" />
            <CompareColumn title="Greedy (one-at-a-time)" tone="warning" rows={compare} which="greedy" />
            <div className="lg:col-span-2 rounded-[8px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-3 text-[13px]">
              <span className="text-[var(--color-text-muted)]">Fleet-wide cost — </span>
              <span className="tabular-nums text-[var(--color-success)]">optimal {compare.optimalCost.toFixed(2)}</span>
              <span className="text-[var(--color-text-muted)]"> vs </span>
              <span className="tabular-nums text-[var(--color-warning)]">greedy {compare.greedyCost.toFixed(2)}</span>
              {compare.greedyCost - compare.optimalCost > 0.001 && (
                <span className="ml-2 text-[var(--color-success)]">
                  · optimal saves {(compare.greedyCost - compare.optimalCost).toFixed(2)} fleet-cost units
                </span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">{label}</span>
      {children}
    </label>
  );
}

function CompareColumn({
  title,
  tone,
  rows,
  which,
}: {
  title: string;
  tone: "success" | "warning";
  rows: CompareResult;
  which: "optimal" | "greedy";
}) {
  const assign = rows[which];
  return (
    <div className="rounded-[8px] border border-[var(--color-border-soft)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[14px] font-medium">{title}</h4>
        <Badge tone={tone}>{assign.length} assignments</Badge>
      </div>
      <ul className="space-y-2 text-[13px]">
        {assign.map((a) => {
          const t = rows.trips.find((x) => x.id === a.tripId);
          const p = rows.pairs.find((x) => x.vehicleId === a.vehicleId && x.driverId === a.driverId);
          return (
            <li key={a.tripId} className="flex items-center justify-between">
              <span className="text-[var(--color-text-primary)]">{t?.route ?? a.tripId}</span>
              <span className="text-[var(--color-text-muted)]">
                {p?.vehicle} / {p?.driver}
              </span>
              <span className="tabular-nums text-[var(--color-text-muted)]">{a.cost.toFixed(2)}</span>
            </li>
          );
        })}
        {assign.length === 0 && <li className="text-[var(--color-text-muted)]">No feasible assignments.</li>}
      </ul>
    </div>
  );
}
