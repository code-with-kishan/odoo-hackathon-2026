import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = PropsWithChildren<{
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}>;

export function EmptyState({ title, description, actionHref, actionLabel, icon }: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-start justify-center rounded-[12px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left">
      <div className="mb-4 rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-background)] p-3 text-[var(--color-text-muted)]">{icon}</div>
      <h3 className="text-[16px] font-medium text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-2 max-w-xl text-[14px] text-[var(--color-text-muted)]">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-4">
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}