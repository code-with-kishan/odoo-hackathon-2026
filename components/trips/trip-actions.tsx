"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex gap-2">
        <Button disabled={busy} onClick={() => call("transition", { status: "COMPLETED" })}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Complete
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => call("transition", { status: "CANCELLED" })}>
          <X size={14} /> Cancel
        </Button>
      </div>
    );
  }
  return null;
}
