import { NextResponse } from "next/server";
import { ads, buildAnalystResult, creativeBrief, signals } from "@/app/lib/demo-data";
import { readStore } from "@/app/lib/file-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();

  return NextResponse.json({
    ads,
    analyst: buildAnalystResult("Find a product angle for recovery and sleep buyers"),
    creativeBrief,
    signals,
    store,
  });
}
