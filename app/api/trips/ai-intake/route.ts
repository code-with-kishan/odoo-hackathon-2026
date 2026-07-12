import { NextResponse } from "next/server";
import { withPermission } from "@/lib/rbac/route-guard";
import { parseTripIntake } from "@/lib/llm/parseTripIntake";

export async function POST(req: Request) {
  const guard = await withPermission("trip:create");
  if (guard.response) return guard.response;
  const body = await req.json();
  const result = await parseTripIntake(body.input ?? "");
  return NextResponse.json(result);
}
