"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const advancedFields = [
  {
    label: "Optimizer capacity-fit weight",
    description: "Weight assigned to how well a vehicle's capacity matches the trip cargo.",
    defaultValue: "0.40",
  },
  {
    label: "Safety score weight",
    description: "Weight for the driver's safety score in the dispatch cost matrix.",
    defaultValue: "0.35",
  },
  {
    label: "License-expiry proximity weight",
    description: "Weight penalising drivers whose license expires soon.",
    defaultValue: "0.25",
  },
  {
    label: "Fuel anomaly z-score threshold",
    description: "Standard deviations from baseline before a fuel entry is flagged.",
    defaultValue: "2.0",
  },
  {
    label: "Maintenance prediction threshold (km)",
    description: "Fallback odometer interval for predictive maintenance when history is insufficient.",
    defaultValue: "15000",
  },
  {
    label: "Notification window (hours)",
    description: "How far ahead to surface upcoming compliance and maintenance alerts.",
    defaultValue: "72",
  },
];

export function AdvancedSettingsCard() {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(advancedFields.map((f) => [f.label, f.defaultValue]))
  );
  const [saved, setSaved] = useState(false);

  function handleChange(label: string, value: string) {
    setValues((prev) => ({ ...prev, [label]: value }));
    setSaved(false);
  }

  function handleSave() {
    // Placeholder — persist to API when backend supports it
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-medium text-[var(--color-text-primary)]">Advanced optimization</h3>
          <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
            Expose optimizer weights, anomaly thresholds, and notification windows only when needed.
          </p>
        </div>
        <Badge tone="warning">{expanded ? "Visible" : "Hidden by default"}</Badge>
      </div>

      <div className="mt-4 flex gap-3">
        <Button onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? "Hide advanced settings" : "Enable advanced settings"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-5 space-y-4 border-t border-[var(--color-border-soft)] pt-5">
          {advancedFields.map((field) => (
            <div key={field.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{field.label}</p>
                <p className="text-[12px] text-[var(--color-text-muted)]">{field.description}</p>
              </div>
              <input
                type="text"
                value={values[field.label]}
                onChange={(e) => handleChange(field.label, e.target.value)}
                className="h-9 w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-[14px] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 sm:w-[120px]"
              />
            </div>
          ))}

          <div className="flex items-center gap-3 border-t border-[var(--color-border-soft)] pt-4">
            <Button onClick={handleSave}>Save changes</Button>
            {saved && (
              <span className="text-[13px] font-medium text-green-500">✓ Saved</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
