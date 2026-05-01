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
    ad_creative_link_captions?: string[];
    ad_creative_link_descriptions?: string[];
    ad_snapshot_url: string;
    spend?: { lower_bound?: string; upper_bound?: string };
    ad_creative_link_titles?: string[];
    images?: string[];
  }>;
  paging?: { cursors?: { after?: string }; next?: string };
};

function classifySpend(lower?: string, upper?: string): string {
  const avg = ((Number(lower) || 0) + (Number(upper) || 0)) / 2;
  if (avg > 50000) return "High";
  if (avg > 10000) return "Rising";
  if (avg > 1000) return "Stable";
  return "Testing";
}

export async function fetchMetaAds(searchTerms: string[]): Promise<MetaAd[]> {
  const token = process.env.META_AD_LIBRARY_TOKEN;
  if (!token) return [];

  const results: MetaAd[] = [];

  for (const term of searchTerms) {
    const params = new URLSearchParams({
      access_token: token,
      ad_type: "ALL",
      ad_reached_countries: "US",
      search_terms: term,
      fields: "id,page_name,ad_creative_bodies,ad_snapshot_url,spend",
      limit: "10",
      ad_active_status: "ACTIVE",
    });

    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/ads_archive?${params.toString()}`,
        { next: { revalidate: 0 } }
      );

      const payload = (await response.json()) as MetaAdLibraryResponse & { error?: { message: string } };

      if ("error" in payload && payload.error) continue;

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
