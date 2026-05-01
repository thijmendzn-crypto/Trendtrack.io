import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ads as demoAds, buildAnalystResult, creativeBrief, shops as demoShops, signals as demoSignals } from "@/app/lib/demo-data";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { readWorkspace } from "@/app/lib/file-store";
import type { Ad, Shop, Signal } from "@/app/lib/types";

export const dynamic = "force-dynamic";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getLiveShops(): Promise<Shop[]> {
  try {
    const db = supabase();
    const { data } = await db
      .from("shops")
      .select("*")
      .order("products", { ascending: false })
      .limit(50);

    if (!data || data.length === 0) return demoShops;

    return data.map((row, index) => ({
      id: index + 1,
      name: row.name,
      domain: row.domain,
      logoUrl: row.logo_url || "",
      storefrontUrl: row.storefront_url || "",
      category: row.category,
      country: row.country,
      currency: row.currency,
      monthlyVisits: row.monthly_visits,
      metaAds: row.meta_ads,
      liveAds: row.live_ads,
      products: row.products,
      trustpilot: row.trustpilot,
      traffic: row.traffic || [10, 12, 11, 14, 13, 15, 16],
      adTrend: row.ad_trend || [1, 1, 2, 2, 3, 3, 4],
      bestSellers: row.best_sellers || [],
      adImages: row.ad_images || [],
      emailImages: row.email_images || [],
      insight: row.insight,
    }));
  } catch {
    return demoShops;
  }
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

    const [shops, signals, ads] = await Promise.all([
      getLiveShops(),
      getLiveSignals(),
      getLiveAds(),
    ]);

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
