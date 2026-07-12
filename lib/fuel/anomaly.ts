/**
 * Fuel/expense anomaly detection — z-score deviation from each vehicle's own
 * trailing fuel-efficiency baseline.
 *
 * Spec reference: IronRoute_FINAL_Build_Spec.md Section 4.7 / Phase 7.
 * This is explicitly labeled *statistical anomaly detection* (z-score over a
 * per-vehicle efficiency baseline), never "AI fraud detection".
 *
 * Efficiency is computed as liters / (distance-per-100km) — but since we only
 * store liters + cost per FuelLog (no per-log distance in the schema), we use
 * cost-per-liter volatility as the baseline signal: a sudden cost-per-liter
 * spike or liters spike flags the entry for review. The label and deviation are
 * surfaced in-app so a human decides.
 */

export type FuelEntry = {
  id: string;
  liters: number;
  cost: number;
  date: Date;
};

export type AnomalyResult = {
  id: string;
  isAnomaly: boolean;
  zScore: number;
  baseline: number;
  observed: number;
  deviation: string;
  explanation: string;
};

const DEFAULT_THRESHOLD = 2.5; // |z| >= 2.5 considered anomalous

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function std(xs: number[], m: number): number {
  if (xs.length < 2) return 0;
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

/**
 * Evaluate a single (latest) entry against the trailing baseline formed by the
 * previous entries for the same vehicle. Entries are expected oldest-first.
 */
export function evaluateEntry(
  entry: FuelEntry,
  history: FuelEntry[],
  threshold: number = DEFAULT_THRESHOLD
): AnomalyResult {
  // Signal = liters per log (proxy for consumption burst). Baseline = trailing mean.
  const baselineSeries = history.map((h) => h.liters);
  const observed = entry.liters;
  const baseline = mean(baselineSeries);
  const sigma = std(baselineSeries, baseline);

  const zScore = sigma > 0 ? (observed - baseline) / sigma : 0;
  const isAnomaly = sigma > 0 && Math.abs(zScore) >= threshold && baselineSeries.length >= 3;

  const pct = baseline > 0 ? ((observed - baseline) / baseline) * 100 : 0;
  const explanation = isAnomaly
    ? `Statistical anomaly: ${observed}L vs ${baseline.toFixed(1)}L baseline (z=${zScore.toFixed(2)}, +${pct.toFixed(0)}%). Flagged for human review.`
    : `Within normal range (z=${zScore.toFixed(2)}).`;

  return {
    id: entry.id,
    isAnomaly,
    zScore: Number(zScore.toFixed(2)),
    baseline: Number(baseline.toFixed(1)),
    observed,
    deviation: `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`,
    explanation,
  };
}

/**
 * Flag the most recent entry per vehicle. Returns a map keyed by entry id.
 */
export function flagAnomalies(
  byVehicle: Record<string, FuelEntry[]>,
  threshold: number = DEFAULT_THRESHOLD
): Record<string, AnomalyResult> {
  const out: Record<string, AnomalyResult> = {};
  for (const [, entries] of Object.entries(byVehicle)) {
    const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const latest = sorted[sorted.length - 1];
    if (!latest) continue;
    const history = sorted.slice(0, -1);
    out[latest.id] = evaluateEntry(latest, history, threshold);
  }
  return out;
}
