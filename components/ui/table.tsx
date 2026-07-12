import { PropsWithChildren, ReactNode } from "react";

export function DataTable({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  );
}

type SortDirection = "asc" | "desc" | null;

export function TableHead({ children }: PropsWithChildren) {
  return (
    <thead className="sticky top-0 bg-[var(--color-background)]">
      <tr className="border-b border-[var(--color-border-soft)]">{children}</tr>
    </thead>
  );
}

export function SortableTh({ children, onSort, direction }: { children: ReactNode; onSort?: () => void; direction?: SortDirection }) {
  return (
    <th className="px-3 py-2 text-left text-[13px] font-[500] text-[var(--color-text-primary)]">
      <button
        type="button"
        onClick={onSort}
        className="inline-flex items-center gap-2 text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
        aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
      >
        {children}
        <span className="text-[12px] text-[var(--color-text-muted)]">{direction === "asc" ? "↑" : direction === "desc" ? "↓" : ""}</span>
      </button>
    </th>
  );
}

export function TableRow({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <tr className={`hover:bg-[var(--color-surface-muted)] ${className}`}>{children}</tr>;
}

export function Td({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <td className={`px-3 py-2 align-middle text-[13px] text-[var(--color-text-primary)] ${className}`}>{children}</td>;
}

export function NumericTd({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <td className={`px-3 py-2 align-middle text-[13px] text-[var(--color-text-primary)] tabular-nums ${className}`}>{children}</td>
  );
}
