import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { flagAnomalies } from "@/lib/fuel/anomaly";
import { z } from "zod";

const fuelSchema = z.object({
  vehicleId: z.string().min(1),
  liters: z.coerce.number().positive("Liters must be greater than zero."),
  cost: z.coerce.number().positive("Cost must be greater than zero."),
  date: z.string().min(1),
});

const expenseSchema = z.object({
  vehicleId: z.string().min(1),
  category: z.string().trim().min(1, "Category is required."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  date: z.string().min(1),
});

export async function GET() {
  // Cost rollup + anomaly flags are visible to anyone who can manage vehicles
  // or view financial reports.
  const guard = await withPermission("vehicle:manage");
  if (guard.response) {
    const fin = await withPermission("reports:view_financial");
    if (fin.response) return fin.response;
  }

  const [fuelLogs, expenses] = await Promise.all([
    prisma.fuelLog.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } }),
    prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } }),
  ]);

  // Group fuel by vehicle (oldest-first) and flag the latest entry per vehicle.
  const byVehicle: Record<string, Array<(typeof fuelLogs)[number]>> = {};
  for (const f of fuelLogs) {
    (byVehicle[f.vehicleId] ??= []).push(f);
  }
  const anomalies = flagAnomalies(byVehicle);

  return NextResponse.json({ fuelLogs, expenses, anomalies });
}

export async function POST(req: Request) {
  const guard = await withPermission("vehicle:manage");
  if (guard.response) return guard.response;

  const body = await req.json();
  const kind: string = body.kind ?? "fuel";

  if (kind === "expense") {
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const created = await prisma.expense.create({
      data: {
        vehicleId: parsed.data.vehicleId,
        category: parsed.data.category,
        amount: parsed.data.amount,
        date: new Date(parsed.data.date),
      },
    });
    return NextResponse.json(created, { status: 201 });
  }

  const parsed = fuelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const created = await prisma.fuelLog.create({
    data: {
      vehicleId: parsed.data.vehicleId,
      liters: parsed.data.liters,
      cost: parsed.data.cost,
      date: new Date(parsed.data.date),
    },
  });
  return NextResponse.json(created, { status: 201 });
}
