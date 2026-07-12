"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CloseMaintenanceButton({ id }: { id: string }) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  async function close() {
    setBusy(true);
    try {
      const res = await fetch(`/api/maintenance/${id}/close`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        push("danger", data.error ?? "Failed to close record.");
        return;
      }
      push("success", "Maintenance closed — vehicle reverted to Available.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" disabled={busy} onClick={close}>
      {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
      Close
    </Button>
  );
}
