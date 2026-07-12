import { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${className}`}>{children}</section>;
}
