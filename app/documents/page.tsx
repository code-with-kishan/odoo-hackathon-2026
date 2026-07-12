import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { prisma } from "@/lib/db/prisma";
import { FileText } from "lucide-react";

export default async function Page() {
  const [documents, vehicles] = await Promise.all([
    prisma.vehicleDocument.findMany({ include: { vehicle: true }, orderBy: { expiresAt: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { registrationNumber: "asc" } }),
  ]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold">Documents</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Registration, insurance, and permit expiry tracking. Upload feeds the notification pipeline.</p>
        </div>

        <Card>
          <h3 className="text-[16px] font-medium">Upload document</h3>
          <div className="mt-3">
            <DocumentUploadForm
              vehicles={vehicles.map((v: { id: string; registrationNumber: string }) => ({ id: v.id, registrationNumber: v.registrationNumber }))}
            />
          </div>
        </Card>

        {documents.length === 0 ? (
          <EmptyState title="No documents uploaded" description="Attach compliance documents to vehicles so expiry reminders can fire." actionHref="/api/vehicles" actionLabel="Add a vehicle" icon={<FileText size={20} />} />
        ) : (
          <Card className="p-0">
            <DataTable>
              <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Days left</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document: { id: string; vehicle: { registrationNumber: string }; type: string; expiresAt: Date }) => {
                  const daysLeft = Math.ceil((document.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                  const tone = daysLeft <= 7 ? "danger" : daysLeft <= 30 ? "warning" : "success";
                  const label = daysLeft <= 0 ? "Expired" : daysLeft <= 7 ? "Due soon" : "Valid";

                  return (
                    <tr key={document.id} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                      <td className="px-4 py-3 font-medium">{document.vehicle.registrationNumber}</td>
                      <td className="px-4 py-3">{document.type}</td>
                      <td className="px-4 py-3">{document.expiresAt.toLocaleDateString()}</td>
                      <td className="px-4 py-3 tabular-nums">{daysLeft > 0 ? `${daysLeft}d` : "—"}</td>
                      <td className="px-4 py-3"><Badge tone={tone}>{label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
