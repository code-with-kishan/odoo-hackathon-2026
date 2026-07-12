import { PropsWithChildren } from "react";

export function KpiCard({ children, className = "", ...props }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(25,25,25,0.04),0_2px_8px_rgba(25,25,25,0.03)] ${className} pop-hover`}
      {...(props as any)}
    >
      {children}
    </div>
  );
}

export function KpiValue({ value, suffix = "", className = "" }: { value: string | number; suffix?: string; className?: string }) {
  return (
    <div className={`text-display font-[600] tabular-nums ${className}`.trim()} style={{ fontVariantNumeric: "tabular-nums" }}>
      {value}
      {suffix}
    </div>
  );
}

export function KpiLabel({ children }: PropsWithChildren) {
  return <div className="mt-2 text-small text-[var(--color-text-muted)] font-[400]">{children}</div>;
}
