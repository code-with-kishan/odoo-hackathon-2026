"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Vehicle = { id: string; registrationNumber: string };

export function FuelExpenseForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [kind, setKind] = useState<"fuel" | "expense">("fuel");
  const [vehicleId, setVehicleId] = useState("");
  const [a, setA] = useState(""); // liters OR amount
  const [b, setB] = useState(""); // cost OR empty
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!vehicleId) return push("warning", "Select a vehicle.");
    setBusy(true);
    try {
      const base = { vehicleId, date };
      const payload =
        kind === "fuel"
          ? { ...base, kind: "fuel", liters: Number(a), cost: Number(b) }
          : { ...base, kind: "expense", category: category || "Other", amount: Number(a) };
      const res = await fetch("/api/fuel-expenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data.issues) ? Object.values(data.issues).flat().join(" ") : data.error ?? "Failed to log entry.";
        push("danger", msg);
        return;
      }
      push("success", `${kind === "fuel" ? "Fuel log" : "Expense"} added.`);
      setA("");
      setB("");
      setCategory("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-6 md:items-end">
      <label className="block md:col-span-1">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Type</span>
        <select value={kind} onChange={(e) => setKind(e.target.value as "fuel" | "expense")} className={inputCls}>
          <option value="fuel">Fuel</option>
          <option value="expense">Expense</option>
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Vehicle</span>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={inputCls}>
          <option value="">Select…</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registrationNumber}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">{kind === "fuel" ? "Liters" : "Amount"}</span>
        <input type="number" value={a} onChange={(e) => setA(e.target.value)} className={inputCls} />
      </label>
      {kind === "fuel" ? (
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Cost</span>
          <input type="number" value={b} onChange={(e) => setB(e.target.value)} className={inputCls} />
        </label>
      ) : (
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Category</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="Tolls, repairs…" />
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </label>
      <div className="md:col-span-6">
        <Button onClick={submit} disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add entry
        </Button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";
