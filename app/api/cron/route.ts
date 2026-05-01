import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchAmazonTrends } from "@/app/lib/fetchers/amazon";
import { fetchGoogleTrends } from "@/app/lib/fetchers/google-trends";
import { fetchMetaAds } from "@/app/lib/fetchers/meta-ads";
import { fetchMilledEmails } from "@/app/lib/fetchers/milled";
import { fetchShops } from "@/app/lib/fetchers/shops";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const META_SEARCH_TERMS = [
  "fitness supplement",
  "skincare routine",
  "pet accessories",
  "home organization",
  "tech gadget",
  "wellness product",
];

export async function GET(request: NextRequest) {
  // Allow Vercel cron or manual trigger with secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabase();
  const log: string[] = [];

  try {
    // 1. Fetch Google Trends → signals (Amazon blocks Vercel IPs)
    const googleTrends = await fetchGoogleTrends();

    const signals = googleTrends.slice(0, 30).map((trend, index) => {
      const score = Math.max(10, Math.min(99, 90 - index * 2 + Math.floor(trend.growth / 10)));
      const markets: Record<string, string> = {
        "recovery gummies": "Fitness", "walking pad": "Home", "hair growth serum": "Beauty",
        "pet enrichment": "Pets", "spf serum": "Beauty", "heatless curls": "Beauty",
        "air purifier filter": "Home", "fabric shaver": "Home", "collagen powder": "Fitness",
        "sleep supplement": "Fitness", "protein snacks": "Fitness", "cold plunge": "Fitness",
        "red light therapy": "Beauty", "gut health supplement": "Fitness", "posture corrector": "Home",
      };

      return {
        name: trend.keyword.charAt(0).toUpperCase() + trend.keyword.slice(1),
        market: markets[trend.keyword] || "General",
        source: "Google Trends",
        score,
        intent: Math.max(10, score - 7),
        speed: `+${Math.abs(trend.growth)}%`,
        status: score >= 80 ? "hot" : "rising",
        angle: `Search interest ${trend.growth > 0 ? "up" : "down"} ${Math.abs(trend.growth)}% over the last 90 days on Google.`,
        refreshed_at: new Date().toISOString(),
      };
    });

    // Replace all signals
    await db.from("signals").delete().neq("id", 0);
    const { error: signalError } = await db.from("signals").insert(signals);
    if (signalError) log.push(`signals error: ${signalError.message}`);
    else log.push(`signals: inserted ${signals.length}`);

    // 2. Fetch Meta Ads
    const metaAds = await fetchMetaAds(META_SEARCH_TERMS);
    if (metaAds.length > 0) {
      await db.from("ads").delete().neq("id", 0);
      const { error: adsError } = await db.from("ads").insert(
        metaAds.map((ad) => ({ ...ad, refreshed_at: new Date().toISOString() }))
      );
      if (adsError) log.push(`ads error: ${adsError.message}`);
      else log.push(`ads: inserted ${metaAds.length}`);
    } else {
      log.push("ads: skipped (no META_AD_LIBRARY_TOKEN or no results)");
    }

    // 3. Fetch real Shopify stores
    const shopData = await fetchShops();
    if (shopData.length > 0) {
      await db.from("shops").delete().neq("id", 0);
      const { error: shopsError } = await db.from("shops").insert(
        shopData.map((shop) => ({
          name: shop.name,
          domain: shop.domain,
          logo_url: shop.logoUrl,
          storefront_url: shop.storefrontUrl,
          category: shop.category,
          country: shop.country,
          currency: shop.currency,
          monthly_visits: "Unknown",
          meta_ads: 0,
          live_ads: 0,
          products: shop.products,
          trustpilot: "N/A",
          traffic: [20, 22, 21, 25, 24, 28, 30],
          ad_trend: [2, 3, 3, 4, 4, 5, 5],
          best_sellers: shop.bestSellers,
          ad_images: shop.bestSellers.slice(0, 2),
          email_images: [],
          insight: shop.insight,
          refreshed_at: new Date().toISOString(),
        }))
      );
      if (shopsError) log.push(`shops error: ${shopsError.message}`);
      else log.push(`shops: inserted ${shopData.length}`);
    } else {
      log.push("shops: no results");
    }

    // 4. Fetch Milled emails
    const emails = await fetchMilledEmails();
    if (emails.length > 0) {
      await db.from("emails").delete().neq("id", 0);
      const { error: emailError } = await db.from("emails").insert(
        emails.map((e) => ({ ...e, refreshed_at: new Date().toISOString() }))
      );
      if (emailError) log.push(`emails error: ${emailError.message}`);
      else log.push(`emails: inserted ${emails.length}`);
    } else {
      log.push("emails: no results from Milled");
    }

    return NextResponse.json({ ok: true, log, refreshed_at: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error), log },
      { status: 500 }
    );
  }
}
