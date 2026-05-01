import { NextRequest, NextResponse } from "next/server";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { buildAnalystResult } from "@/app/lib/demo-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await getActorId();
    const body = (await request.json()) as { prompt?: string };
    return NextResponse.json(buildAnalystResult(String(body.prompt || "")));
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}
