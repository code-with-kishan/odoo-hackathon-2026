import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TripCreateForm } from "@/components/trips/trip-create-form";
import { TripActions } from "@/components/trips/trip-actions";
import { prisma } from "@/lib/db/prisma";
import { getCurrentRole } from "@/lib/auth/current-user";
import { Route } from "lucide-react";
import type { Permission } from "@/lib/rbac/permissions";
import { can } from "@/lib/rbac/permissions";

function toneForTrip(status: string) {
  if (status === "DISPATCHED") return "info";
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  return "warning";
}

export default async function TripsPage() {
  const role = await getCurrentRole();
  const canCreate = can(role, "trip:create" as Permission);
  const [trips, vehicles, drivers] = await Promise.all([
    prisma.trip.findMany({ include: { vehicle: true, driver: true }, orderBy: { createdAt: "desc" } }),
    prisma.vehicle.findMany({ orderBy: { registrationNumber: "asc" } }),
    prisma.driver.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold">Trips</h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            Lifecycle: Draft → Dispatched → Completed/Cancelled enforced server-side. AI intake + batch optimizer included.
          </p>
        </div>

        {canCreate && (
          <TripCreateForm
            vehicles={vehicles.map((v: { id: string; registrationNumber: string; nameModel: string; maxLoadCapacityKg: number; status: string }) => ({
              id: v.id,
              registrationNumber: v.registrationNumber,
              nameModel: v.nameModel,
              maxLoadCapacityKg: v.maxLoadCapacityKg,
              status: v.status,
            }))}
            drivers={drivers.map((d: { id: string; name: string; licenseCategory: string; licenseExpiryDate: Date; safetyScore: number; status: string }) => ({
              id: d.id,
              name: d.name,
              licenseCategory: d.licenseCategory,
              licenseExpiryDate: d.licenseExpiryDate.toISOString(),
              safetyScore: d.safetyScore,
              status: d.status,
            }))}
          />
        )}

        {trips.length === 0 ? (
          <EmptyState
            title="No trips yet"
            description="Create your first trip to begin dispatch planning and optimizer review."
            actionLabel="Create your first trip"
            actionHref="/trips?new=true"
            icon={<Route size={20} />}
          />
        ) : (
          <Card className="p-0">
            <DataTable>
              <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[12px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip: { id: string; source: string; destination: string; vehicleId: string | null; driverId: string | null; cargoWeightKg: number; plannedDistanceKm: number; status: string; vehicle: { registrationNumber: string } | null; driver: { name: string } | null }) => (
                  <tr key={trip.id} className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{trip.source} → {trip.destination}</td>
                    <td className="px-4 py-3">{trip.vehicle?.registrationNumber ?? "Unassigned"}</td>
                    <td className="px-4 py-3">{trip.driver?.name ?? "Unassigned"}</td>
                    <td className="px-4 py-3 tabular-nums">{trip.cargoWeightKg} kg</td>
                    <td className="px-4 py-3 tabular-nums">{trip.plannedDistanceKm} km</td>
                    <td className="px-4 py-3"><Badge tone={toneForTrip(trip.status)}>{trip.status.replaceAll("_", " ")}</Badge></td>
                    <td className="px-4 py-3">
                      <TripActions
                        tripId={trip.id}
                        status={trip.status}
                        hasAssignment={Boolean(trip.vehicleId && trip.driverId)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
