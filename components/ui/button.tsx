import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "link";

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[8px] px-4 py-2 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50";
  const styles: Record<Variant, string> = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
    secondary: "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]",
    link: "px-0 text-[var(--color-link)] hover:underline",
  };
  return <button type={type} className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
