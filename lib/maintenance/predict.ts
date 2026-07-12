/**
 * Predictive maintenance — simple linear regression per vehicle over the
 * historical maintenance-interval-vs-odometer signal.
 *
 * Spec reference: IronRoute_FINAL_Build_Spec.md Section 4.6 / Phase 7.
 * - With sufficient history we fit least-squares slope/intercept over the
 *   sequence of (cumulative service index, openedAt timestamp) to estimate the
 *   expected days-until-next-service.
 * - With insufficient history (new vehicles) we fall back to a configurable
 *   static threshold (default 90 days), as mandated by Section 4.6.
 */

export type MaintenanceHistoryPoint = { openedAt: Date; odometerKm: number };

export type Prediction =
  | {
      predicted: true;
      method: "linear-regression";
      nextServiceAt: Date;
      daysUntilDue: number;
      confidence: number;
    }
  | {
      predicted: true;
      method: "static-fallback";
      nextServiceAt: Date;
      daysUntilDue: number;
      reason: string;
    }
  | { predicted: false; reason: string };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function leastSquares(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

export function predictNextService(
  history: MaintenanceHistoryPoint[],
  opts: { fallbackDays?: number; now?: Date } = {}
): Prediction {
  const fallbackDays = opts.fallbackDays ?? 90;
  const now = (opts.now ?? new Date()).getTime();

  // Need at least 2 points to fit a regression; otherwise fall back.
  if (history.length < 2) {
    const next = new Date(now + fallbackDays * MS_PER_DAY);
    return {
      predicted: true,
      method: "static-fallback",
      nextServiceAt: next,
      daysUntilDue: Math.round((next.getTime() - now) / MS_PER_DAY),
      reason: `Insufficient history (need ≥2 past services); using static ${fallbackDays}-day window.`,
    };
  }

  const sorted = [...history].sort((a, b) => a.openedAt.getTime() - b.openedAt.getTime());
  const xs = sorted.map((p) => p.openedAt.getTime());
  const ys = sorted.map((p) => p.odometerKm);

  const { slope, intercept } = leastSquares(xs, ys);
  if (slope <= 0) {
    // Degenerate fit (e.g. services clustered on one day): fall back.
    const next = new Date(now + fallbackDays * MS_PER_DAY);
    return {
      predicted: true,
      method: "static-fallback",
      nextServiceAt: next,
      daysUntilDue: Math.round((next.getTime() - now) / MS_PER_DAY),
      reason: `Regression slope non-positive; using static ${fallbackDays}-day window.`,
    };
  }

  // Average interval between services (days) = mean odometer gain / mean time gain * ... ->
  // we instead predict next service timestamp using the fitted odometer rate.
  const lastOpened = xs[xs.length - 1];
  const lastOdo = ys[ys.length - 1];
  // Estimated timestamp at which odometer reaches lastOdo + averageIntervalKm.
  const avgIntervalKm =
    ys.length > 1 ? (ys[ys.length - 1] - ys[0]) / (ys.length - 1) : 1000;
  const targetOdo = lastOdo + Math.max(1, avgIntervalKm);
  const nextTs = (targetOdo - intercept) / slope;
  const nextServiceAt = new Date(nextTs);
  const daysUntilDue = Math.round((nextTs - now) / MS_PER_DAY);

  // R² over the fit as a lightweight confidence proxy (0..1).
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < xs.length; i++) {
    const pred = slope * xs[i] + intercept;
    ssTot += (ys[i] - meanY) ** 2;
    ssRes += (ys[i] - pred) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return {
    predicted: true,
    method: "linear-regression",
    nextServiceAt,
    daysUntilDue,
    confidence: Number(r2.toFixed(2)),
  };
}

/** Convenience: is the predicted window "approaching" within `withinDays`? */
export function isApproaching(p: Prediction, withinDays = 14): boolean {
  return p.predicted && p.daysUntilDue <= withinDays;
}
