"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type Props = {
  tripId: string;
  status: string;
  hasAssignment: boolean;
};

export function TripActions({ tripId, status, hasAssignment }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Form states for completion inputs
  const [odometerKm, setOdometerKm] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  async function call(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    try {
      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, tripId, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push("danger", Array.isArray(data.errors) ? data.errors.join(" ") : data.error ?? "Action failed.");
        return;
      }
      const verb = action === "dispatch" ? "Dispatched" : "transition";
      push("success", `${verb} — status cascade applied.`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleCompleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!odometerKm || !fuelLiters || !fuelCost) {
      push("warning", "Please fill in all inputs.");
      return;
    }
    
    setBusy(true);
    try {
      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "transition",
          tripId,
          status: "COMPLETED",
          odometerKm: Number(odometerKm),
          fuelLiters: Number(fuelLiters),
          fuelCost: Number(fuelCost),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        push("danger", data.error ?? "Action failed.");
        return;
      }
      push("success", "Trip completed successfully. Vehicle odometer and fuel logs updated.");
      setShowModal(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === "DRAFT") {
    return (
      <Button variant="secondary" disabled={busy || !hasAssignment} onClick={() => call("dispatch")}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Dispatch
      </Button>
    );
  }

  if (status === "DISPATCHED") {
    return (
      <>
        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => setShowModal(true)}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Complete
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => call("transition", { status: "CANCELLED" })}>
            <X size={14} /> Cancel
          </Button>
        </div>

        {showModal && (
          <Modal>
            <div className="flex flex-col gap-1">
              <h3 className="text-[18px] font-bold text-[var(--color-text-primary)]">Complete Trip</h3>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                Log final odometer reading and fuel consumption to close this delivery.
              </p>
            </div>

            <form onSubmit={handleCompleteSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--color-text-muted)] mb-1">
                  Final Odometer Reading (km)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[14px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--color-text-muted)] mb-1">
                    Fuel Consumed (Liters)
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--color-text-muted)] mb-1">
                    Fuel Cost ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="e.g. 90"
                    className="w-full rounded-[8px] border border-[var(--color-border)] px-3 py-2 text-[14px]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                  Complete Trip
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </>
    );
  }

  return null;
}
