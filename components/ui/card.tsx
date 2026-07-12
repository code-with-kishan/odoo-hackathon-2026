import { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={`rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_1px_2px_rgba(25,25,25,0.04),0_2px_8px_rgba(25,25,25,0.03)] ${className}`}
    >
      {children}
    </section>
  );
}
