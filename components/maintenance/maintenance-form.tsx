"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Vehicle = { id: string; registrationNumber: string; status: string };

export function MaintenanceForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const eligible = vehicles.filter((v) => v.status !== "RETIRED" && v.status !== "IN_SHOP");

  async function submit() {
    if (!vehicleId || !description.trim()) {
      push("warning", "Select an eligible vehicle and add a description.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ vehicleId, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push("danger", data.error ?? "Failed to open maintenance record.");
        return;
      }
      push("success", "Maintenance opened — vehicle moved to In Shop and hidden from dispatch.");
      setVehicleId("");
      setDescription("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Vehicle</span>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={inputCls}>
          <option value="">Select vehicle…</option>
          {eligible.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registrationNumber} ({v.status.replaceAll("_", " ")})
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Description</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="e.g. Brake pad replacement" />
      </label>
      <Button onClick={submit} disabled={busy}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Open record
      </Button>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";
