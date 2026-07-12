import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withPermission } from "@/lib/rbac/route-guard";

export async function GET(req: Request) {
  const guard = await withPermission("vehicle:manage");
  if (guard.response) return guard.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const sort = searchParams.get("sort") === "registration" ? { registrationNumber: "asc" as const } : { createdAt: "desc" as const };

  const rows = await prisma.vehicle.findMany({
    where: {
      registrationNumber: { contains: q, mode: "insensitive" },
      ...(status ? { status: status as never } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: sort,
    include: { documents: true },
  });

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const guard = await withPermission("vehicle:manage");
  if (guard.response) return guard.response;

  const body = await req.json();
  try {
    const created = await prisma.vehicle.create({ data: body });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (String(error).includes("registrationNumber")) {
      return NextResponse.json({ error: "Registration number must be unique." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 400 });
  }
}
