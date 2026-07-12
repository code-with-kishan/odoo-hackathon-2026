"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";

export function RoleMatrixButton() {
  const [isOpen, setIsOpen] = useState(false);

  const matrix = [
    {
      role: "Fleet Manager",
      create: "Yes",
      dispatch: "Yes",
      manage: "Yes",
      maintenance: "Yes",
      financial: "View only",
      admin: "No",
    },
    {
      role: "Driver",
      create: "Yes (own)",
      dispatch: "No",
      manage: "View own",
      maintenance: "No",
      financial: "No",
      admin: "No",
    },
    {
      role: "Safety Officer",
      create: "No",
      dispatch: "No",
      manage: "Compliance",
      maintenance: "No",
      financial: "No",
      admin: "No",
    },
    {
      role: "Financial Analyst",
      create: "No",
      dispatch: "No",
      manage: "No",
      maintenance: "No",
      financial: "Yes (Full)",
      admin: "No",
    },
    {
      role: "Admin",
      create: "Yes",
      dispatch: "Yes",
      manage: "Yes",
      maintenance: "Yes",
      financial: "Yes",
      admin: "Yes",
    },
  ];

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)} className="cursor-pointer">
        View role matrix
      </Button>

      {isOpen && (
        <Modal>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[var(--color-primary)]" />
                <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">RBAC Permission Matrix</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-[6px] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[13px] text-[var(--color-text-muted)]">
              This matrix defines the Role-Based Access Controls (RBAC) enforced server-side and client-side across the platform.
            </p>

            <div className="overflow-x-auto rounded-[8px] border border-[var(--color-border)]">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                    <th className="p-3 font-semibold text-[var(--color-text-primary)]">Role</th>
                    <th className="p-3 font-semibold text-[var(--color-text-primary)]">Create Trip</th>
                    <th className="p-3 font-semibold text-[var(--color-text-primary)]">Dispatch</th>
                    <th className="p-3 font-semibold text-[var(--color-text-primary)]">Manage Fleet</th>
                    <th className="p-3 font-semibold text-[var(--color-text-primary)]">Maintenance</th>
                    <th className="p-3 font-semibold text-[var(--color-text-primary)]">Financials</th>
                    <th className="p-3 font-semibold text-[var(--color-text-primary)]">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-soft)]">
                  {matrix.map((row) => (
                    <tr key={row.role} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                      <td className="p-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{row.role}</td>
                      <td className="p-3 text-[var(--color-text-muted)]">{row.create}</td>
                      <td className="p-3 text-[var(--color-text-muted)]">{row.dispatch}</td>
                      <td className="p-3 text-[var(--color-text-muted)]">{row.manage}</td>
                      <td className="p-3 text-[var(--color-text-muted)]">{row.maintenance}</td>
                      <td className="p-3 text-[var(--color-text-muted)]">{row.financial}</td>
                      <td className="p-3 text-[var(--color-text-muted)]">{row.admin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-2">
              <Button onClick={() => setIsOpen(false)} className="cursor-pointer">Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
