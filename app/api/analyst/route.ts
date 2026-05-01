import { NextRequest, NextResponse } from "next/server";
import { buildAnalystResult } from "@/app/lib/demo-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { prompt?: string };
  return NextResponse.json(buildAnalystResult(String(body.prompt || "")));
}
