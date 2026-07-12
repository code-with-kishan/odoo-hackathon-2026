"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Item = {
  id: string;
  type: string;
  title: string;
  body: string;
  sentAt: string;
};

const toneFor = (t: string) =>
  t === "LICENSE_EXPIRY" || t === "DOCUMENT_EXPIRY" ? "warning" : t === "MAINTENANCE_DUE" ? "info" : "success";

export function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const { push } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      const data = await res.json();
      push(data.created > 0 ? "success" : "info", data.created > 0 ? `${data.created} new reminder(s) generated.` : "No new reminders.");
      await load();
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="p-4 text-[13px] text-[var(--color-text-muted)]">Loading notifications…</div>;
  }

  const shown = compact ? items.slice(0, 5) : items;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[var(--color-text-muted)]">License / document expiry & predictive maintenance reminders.</p>
        <Button variant="secondary" onClick={scan} disabled={scanning}>
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Scan now
        </Button>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-[8px] border border-dashed border-[var(--color-border)] p-6 text-center text-[13px] text-[var(--color-text-muted)]">
          No notifications. Run a scan to detect expiring licenses/documents and predicted service windows.
        </p>
      ) : (
        <ul className="space-y-2">
          {shown.map((n) => (
            <li key={n.id} className="flex items-start gap-3 rounded-[8px] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3">
              <Badge tone={toneFor(n.type)}>{n.type.replaceAll("_", " ")}</Badge>
              <div className="flex-1">
                <p className="text-[13px] text-[var(--color-text-primary)]">{stripDedup(n.body)}</p>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-subtle)]">{new Date(n.sentAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The dedup key (e.g. "[DOCUMENT_EXPIRY:id:6d]") is stripped from the body for display.
function stripDedup(s: string): string {
  return s.replace(/^\[[^\]]+\]\s*/, "");
}
