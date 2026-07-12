import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";
import { buildReportRows, toCSV, toPDF } from "@/lib/reports/export";

// Section 2 permission matrix: financial reports are FINANCIAL_ANALYST (full)
// and ADMIN only. Fleet Managers are "View only" — allowed to read summaries
// but not exports, so we require reports:view_financial here.
export async function GET(req: Request) {
  const guard = await withPermission("reports:view_financial");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") ?? "csv").toLowerCase();

  const vehicles = await prisma.vehicle.findMany({
    include: {
      maintenanceLogs: true,
      fuelLogs: true,
      expenses: true,
      trips: { where: { status: "COMPLETED" } },
    },
    orderBy: { registrationNumber: "asc" },
  });

  const rows = buildReportRows(vehicles);

  if (format === "pdf") {
    const pdf = toPDF(rows);
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="ironroute-report.pdf"',
      },
    });
  }

  const csv = toCSV(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="ironroute-report.csv"',
    },
  });
}
