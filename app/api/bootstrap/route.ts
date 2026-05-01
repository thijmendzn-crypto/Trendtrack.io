import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ads as demoAds, buildAnalystResult, creativeBrief, shops, signals as demoSignals } from "@/app/lib/demo-data";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { readWorkspace } from "@/app/lib/file-store";
import type { Ad, Signal } from "@/app/lib/types";

export const dynamic = "force-dynamic";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getLiveSignals(): Promise<Signal[]> {
  try {
    const db = supabase();
    const { data } = await db
      .from("signals")
      .select("*")
      .order("score", { ascending: false })
      .limit(30);

    if (!data || data.length === 0) return demoSignals;

    return data.map((row, index) => ({
      id: index + 1,
      name: row.name,
      market: row.market,
      source: row.source,
      score: row.score,
      intent: row.intent,
      speed: row.speed,
      status: row.status as "hot" | "rising",
      angle: row.angle,
    }));
  } catch {
    return demoSignals;
  }
}

async function getLiveAds(): Promise<Ad[]> {
  try {
    const db = supabase();
    const { data } = await db
      .from("ads")
      .select("*")
      .order("refreshed_at", { ascending: false })
      .limit(20);

    if (!data || data.length === 0) return demoAds;

    return data.map((row) => ({
      brand: row.brand,
      hook: row.hook,
      spend: row.spend,
      format: row.format,
      lift: row.lift || "+0%",
    }));
  } catch {
    return demoAds;
  }
}

export async function GET() {
  try {
    const actorId = await getActorId();
    const store = await readWorkspace(actorId);

    const [signals, ads] = await Promise.all([getLiveSignals(), getLiveAds()]);

    return NextResponse.json({
      ads,
      analyst: buildAnalystResult("Find a product angle for recovery and sleep buyers"),
      creativeBrief,
      shops,
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
