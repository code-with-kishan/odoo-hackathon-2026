import { PropsWithChildren } from "react";

const toneMap = {
  success: "text-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
  warning: "text-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
  danger: "text-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
  info: "text-[var(--color-info)] bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
};

export function Badge({ children, tone = "info" }: PropsWithChildren<{ tone?: keyof typeof toneMap }>) {
  return <span className={`inline-flex rounded-full px-[10px] py-1 text-[12px] font-medium ${toneMap[tone]}`}>{children}</span>;
}
