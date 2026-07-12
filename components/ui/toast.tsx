"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

type Tone = "success" | "warning" | "danger" | "info";
type Toast = { id: number; tone: Tone; message: string };

type ToastCtx = { push: (tone: Tone, message: string) => void };
const Ctx = createContext<ToastCtx>({ push: () => {} });

export function useToast() {
  return useContext(Ctx);
}

const accent: Record<Tone, string> = {
  success: "border-l-[var(--color-success)]",
  warning: "border-l-[var(--color-warning)]",
  danger: "border-l-[var(--color-danger)]",
  info: "border-l-[var(--color-info)]",
};
const iconFor: Record<Tone, ReactNode> = {
  success: <CheckCircle2 size={16} className="text-[var(--color-success)]" />,
  warning: <AlertTriangle size={16} className="text-[var(--color-warning)]" />,
  danger: <XCircle size={16} className="text-[var(--color-danger)]" />,
  info: <Info size={16} className="text-[var(--color-info)]" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((tone: Tone, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, message }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== t.id)), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-[8px] border border-l-4 border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[13px] shadow-[0_1px_2px_rgba(25,25,25,0.04),0_2px_8px_rgba(25,25,25,0.03)] ${accent[t.tone]}`}
          >
            <span className="mt-0.5">{iconFor[t.tone]}</span>
            <span className="flex-1 text-[var(--color-text-primary)]">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
