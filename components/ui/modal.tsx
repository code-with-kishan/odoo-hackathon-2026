import { PropsWithChildren } from "react";

export function Modal({ children }: PropsWithChildren) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(25,25,25,0.4)] p-4">
      <div className="w-full max-w-xl rounded-[12px] border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-[0_1px_2px_rgba(25,25,25,0.04),0_2px_8px_rgba(25,25,25,0.03)]">{children}</div>
    </div>
  );
}
