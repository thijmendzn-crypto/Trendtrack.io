import { NextResponse } from "next/server";
import { ads, buildAnalystResult, creativeBrief, signals } from "@/app/lib/demo-data";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { readWorkspace } from "@/app/lib/file-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actorId = await getActorId();
    const store = await readWorkspace(actorId);

    return NextResponse.json({
      ads,
      analyst: buildAnalystResult("Find a product angle for recovery and sleep buyers"),
      creativeBrief,
      signals,
      store,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}
