// @ts-expect-error google-trends-api has no types
import googleTrends from "google-trends-api";

export type TrendResult = {
  keyword: string;
  growth: number;
};

const KEYWORDS = [
  "recovery gummies",
  "walking pad",
  "hair growth serum",
  "pet enrichment",
  "spf serum",
  "heatless curls",
  "air purifier filter",
  "fabric shaver",
  "collagen powder",
  "sleep supplement",
  "protein snacks",
  "cold plunge",
  "red light therapy",
  "gut health supplement",
  "posture corrector",
];

async function getTrend(keyword: string): Promise<TrendResult> {
  try {
    const raw = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      geo: "US",
    });

    const parsed = JSON.parse(raw) as {
      default?: { timelineData?: Array<{ value: number[] }> };
    };

    const timeline = parsed.default?.timelineData || [];
    if (timeline.length < 2) return { keyword, growth: 0 };

    const recent = timeline.slice(-4).map((d) => d.value[0]);
    const older = timeline.slice(-12, -8).map((d) => d.value[0]);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length || 1;

    const growth = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
    return { keyword, growth };
  } catch {
    return { keyword, growth: 0 };
  }
}

export async function fetchGoogleTrends(): Promise<TrendResult[]> {
  const results: TrendResult[] = [];

  // Fetch in batches to avoid rate limits
  for (let i = 0; i < KEYWORDS.length; i += 3) {
    const batch = KEYWORDS.slice(i, i + 3);
    const batchResults = await Promise.all(batch.map(getTrend));
    results.push(...batchResults);
    if (i + 3 < KEYWORDS.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results.sort((a, b) => b.growth - a.growth);
}
