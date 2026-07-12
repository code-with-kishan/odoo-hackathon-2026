import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";

export async function GET(req: Request) {
  const guard = await withPermission("driver:manage");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;
  const category = searchParams.get("licenseCategory") ?? undefined;

  const rows = await prisma.driver.findMany({
    where: {
      name: { contains: q },
      ...(status ? { status: status as never } : {}),
      ...(category ? { licenseCategory: category } : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const guard = await withPermission("driver:manage");
  if (guard.response) return guard.response;

  const body = await req.json();
  const created = await prisma.driver.create({ data: { ...body, licenseExpiryDate: new Date(body.licenseExpiryDate) } });
  return NextResponse.json(created, { status: 201 });
}
