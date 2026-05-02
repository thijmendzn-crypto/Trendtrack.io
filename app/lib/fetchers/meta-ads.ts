export type MetaAd = {
  ad_id: string;
  brand: string;
  page_name: string;
  hook: string;
  image_url: string | null;
  ad_url: string;
  spend: string;
  format: string;
};

type MetaAdLibraryResponse = {
  data?: Array<{
    id: string;
    page_name: string;
    ad_creative_bodies?: string[];
    ad_snapshot_url: string;
    spend?: { lower_bound?: string; upper_bound?: string };
  }>;
  error?: { message: string };
};

function classifySpend(lower?: string, upper?: string): string {
  const avg = ((Number(lower) || 0) + (Number(upper) || 0)) / 2;
  if (avg > 50000) return "High";
  if (avg > 10000) return "Rising";
  if (avg > 1000) return "Stable";
  return "Testing";
}

async function getMetaToken(): Promise<string | null> {
  const envToken = process.env.META_AD_LIBRARY_TOKEN;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await db.from("meta_token").select("token").eq("id", 1).maybeSingle();
    if (data?.token) return data.token;
  } catch {
    // fall through
  }

  return envToken || null;
}

async function fetchViaApi(searchTerms: string[], token: string): Promise<MetaAd[]> {
  const results: MetaAd[] = [];

  for (const term of searchTerms) {
    const params = new URLSearchParams({
      access_token: token,
      ad_type: "ALL",
      ad_reached_countries: "US",
      search_terms: term,
      fields: "id,page_name,ad_creative_bodies,ad_snapshot_url,spend",
      limit: "8",
      ad_active_status: "ACTIVE",
    });

    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/ads_archive?${params.toString()}`,
        { signal: AbortSignal.timeout(10000) }
      );

      const payload = (await response.json()) as MetaAdLibraryResponse;
      if (payload.error) continue;

      for (const ad of payload.data || []) {
        const body = ad.ad_creative_bodies?.[0] || "";
        results.push({
          ad_id: ad.id,
          brand: ad.page_name,
          page_name: ad.page_name,
          hook: body.slice(0, 120) || `${term} ad`,
          image_url: null,
          ad_url: ad.ad_snapshot_url,
          spend: classifySpend(ad.spend?.lower_bound, ad.spend?.upper_bound),
          format: body.includes("?") ? "Question hook" : body.length > 80 ? "Story" : "Direct",
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

// Fallback: scrape public Ad Library search
async function fetchViaPublicSearch(searchTerms: string[]): Promise<MetaAd[]> {
  const results: MetaAd[] = [];

  for (const term of searchTerms.slice(0, 3)) {
    try {
      const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${encodeURIComponent(term)}&search_type=keyword_unordered&media_type=all`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract page names and ad copy from the JSON embedded in the page
      const pageNameRegex = /"page_name"\s*:\s*"([^"]{3,50})"/g;
      const bodyRegex = /"body"\s*:\s*\{[^}]*"text"\s*:\s*"([^"]{20,150})"/g;

      const pageNames: string[] = [];
      const bodies: string[] = [];

      let m;
      while ((m = pageNameRegex.exec(html)) !== null && pageNames.length < 5) {
        pageNames.push(m[1]);
      }
      while ((m = bodyRegex.exec(html)) !== null && bodies.length < 5) {
        bodies.push(m[1].replace(/\\n/g, " ").replace(/\\"/g, '"'));
      }

      pageNames.forEach((name, i) => {
        results.push({
          ad_id: `public-${term}-${i}`,
          brand: name,
          page_name: name,
          hook: bodies[i] || `${term} ad`,
          image_url: null,
          ad_url: url,
          spend: "Unknown",
          format: bodies[i]?.includes("?") ? "Question hook" : "Direct",
        });
      });
    } catch {
      continue;
    }
  }

  return results;
}

export async function fetchMetaAds(searchTerms: string[]): Promise<MetaAd[]> {
  const token = await getMetaToken();

  if (token) {
    const apiResults = await fetchViaApi(searchTerms, token);
    if (apiResults.length > 0) return apiResults;
  }

  // Fallback to public search
  return fetchViaPublicSearch(searchTerms);
}
