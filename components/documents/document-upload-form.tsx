"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Vehicle = { id: string; registrationNumber: string };

export function DocumentUploadForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] = useState("Insurance");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!vehicleId) return push("warning", "Select a vehicle.");
    if (!expiresAt) return push("warning", "Expiry date is required.");
    if (!file) return push("warning", "Choose a file to upload.");
    setBusy(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          type,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          data,
          expiresAt: new Date(expiresAt).toISOString(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(body.issues) ? Object.values(body.issues).flat().join(" ") : body.error ?? "Upload failed.";
        push("danger", msg);
        return;
      }
      push("success", "Document uploaded — expiry reminders will fire from the notification scan.");
      setVehicleId("");
      setExpiresAt("");
      setFile(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-5 md:items-end">
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
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Type</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          <option>Insurance</option>
          <option>Registration</option>
          <option>Permit</option>
          <option>Other</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">Expires</span>
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-[var(--color-text-muted)]">File</span>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-[13px] text-[var(--color-text-muted)] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[var(--color-surface-muted)] file:px-3 file:py-2 file:text-[13px]"
        />
      </label>
      <div className="md:col-span-5">
        <Button onClick={submit} disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload document
        </Button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";
