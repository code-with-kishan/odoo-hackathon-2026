import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "link";

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = "rounded-[8px] px-4 py-2 text-[14px] font-medium transition-colors";
  const styles: Record<Variant, string> = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
    secondary: "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)]",
    link: "text-[var(--color-link)] hover:underline px-0",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
