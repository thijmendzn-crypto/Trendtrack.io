import type { Ad, AnalystResult, Shop, Signal } from "./types";

export const signals: Signal[] = [
  {
    id: 1,
    name: "Post-workout recovery gummies",
    market: "Fitness",
    source: "TikTok",
    score: 94,
    intent: 87,
    speed: "+48%",
    status: "hot",
    angle: "Creator routines focus on soreness, sleep quality and next-day energy.",
  },
  {
    id: 2,
    name: "Pet hair air purifier filters",
    market: "Pets",
    source: "Search",
    score: 89,
    intent: 82,
    speed: "+36%",
    status: "hot",
    angle: "Searches cluster around allergies, odor and rental apartments.",
  },
  {
    id: 3,
    name: "Heatless curl travel kits",
    market: "Beauty",
    source: "Meta",
    score: 86,
    intent: 78,
    speed: "+29%",
    status: "rising",
    angle: "Ads with before/after visuals hold attention above category average.",
  },
  {
    id: 4,
    name: "Under-desk walking pads",
    market: "Home",
    source: "Amazon",
    score: 84,
    intent: 81,
    speed: "+25%",
    status: "rising",
    angle: "Buyer intent rises around compact storage and quiet motors.",
  },
  {
    id: 5,
    name: "AI product photo backgrounds",
    market: "Tech",
    source: "Meta",
    score: 80,
    intent: 74,
    speed: "+21%",
    status: "rising",
    angle: "Small stores want faster ad creative without studio shoots.",
  },
  {
    id: 6,
    name: "Mineral SPF serum sticks",
    market: "Beauty",
    source: "TikTok",
    score: 78,
    intent: 73,
    speed: "+18%",
    status: "rising",
    angle: "Portable skincare is trending with travel and gym bag content.",
  },
  {
    id: 7,
    name: "Cordless fabric shavers",
    market: "Home",
    source: "Search",
    score: 75,
    intent: 69,
    speed: "+14%",
    status: "rising",
    angle: "Low-ticket problem solving product with strong visual proof.",
  },
  {
    id: 8,
    name: "Dog enrichment freezer trays",
    market: "Pets",
    source: "TikTok",
    score: 72,
    intent: 66,
    speed: "+12%",
    status: "rising",
    angle: "Owners respond to calming routines and recipe-led content.",
  },
];

export const ads: Ad[] = [
  {
    brand: "FlexFuel",
    hook: "Sore legs tomorrow? Not if this is in your routine.",
    spend: "High",
    format: "UGC demo",
    lift: "+31%",
  },
  {
    brand: "PawPure",
    hook: "The apartment smell fix pet owners keep reordering.",
    spend: "Rising",
    format: "Problem/solution",
    lift: "+24%",
  },
  {
    brand: "GlowLoop",
    hook: "Salon curls without heat damage in 8 minutes.",
    spend: "High",
    format: "Before/after",
    lift: "+28%",
  },
  {
    brand: "DeskStep",
    hook: "10k steps while clearing your inbox.",
    spend: "Stable",
    format: "Founder demo",
    lift: "+19%",
  },
  {
    brand: "Backdroply",
    hook: "Turn one product photo into a full ad set.",
    spend: "Rising",
    format: "Screen capture",
    lift: "+22%",
  },
  {
    brand: "SunSnap",
    hook: "SPF that fits next to your keys.",
    spend: "Testing",
    format: "Routine stack",
    lift: "+16%",
  },
];

export const shops: Shop[] = [
  {
    id: 1,
    name: "Obvi",
    domain: "myobvi.com",
    logoUrl:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=320&q=80",
    storefrontUrl:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=640&q=80",
    category: "Beauty & Fitness",
    country: "US",
    currency: "USD",
    monthlyVisits: "83K",
    metaAds: 49,
    liveAds: 128,
    products: 53,
    trustpilot: "4.7",
    traffic: [18, 31, 28, 42, 44, 37, 52, 49],
    adTrend: [22, 25, 28, 36, 39, 43, 46, 52],
    bestSellers: [
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=220&q=80",
    ],
    adImages: [
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=220&q=80",
    ],
    emailImages: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=220&q=80",
    ],
    insight: "High creative velocity around supplements, beauty bundles and repeat-purchase offers.",
  },
  {
    id: 2,
    name: "Obvious Golf Co.",
    domain: "obviousgolfco.com",
    logoUrl:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=320&q=80",
    storefrontUrl:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=640&q=80",
    category: "Apparel",
    country: "UK",
    currency: "GBP",
    monthlyVisits: "38K",
    metaAds: 94,
    liveAds: 74,
    products: 13,
    trustpilot: "4.5",
    traffic: [52, 44, 35, 42, 39, 46, 32, 29],
    adTrend: [30, 58, 21, 42, 17, 33, 27, 31],
    bestSellers: [
      "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1621993202323-f438eec93417?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=220&q=80",
    ],
    adImages: [
      "https://images.unsplash.com/photo-1591491653056-4f3c1c64656d?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1611374243147-44a70293d44c?auto=format&fit=crop&w=220&q=80",
    ],
    emailImages: [
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?auto=format&fit=crop&w=220&q=80",
    ],
    insight: "Ad spikes suggest a narrow seasonal push with strong product visual proof.",
  },
  {
    id: 3,
    name: "Obvious Mimic Press",
    domain: "obviousmimic.com",
    logoUrl:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=320&q=80",
    storefrontUrl:
      "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=640&q=80",
    category: "Books & Literature",
    country: "BR",
    currency: "USD",
    monthlyVisits: "58K",
    metaAds: 3,
    liveAds: 18,
    products: 66,
    trustpilot: "4.2",
    traffic: [26, 39, 33, 28, 47, 41, 29, 44],
    adTrend: [41, 48, 12, 39, 35, 14, 9, 10],
    bestSellers: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=220&q=80",
    ],
    adImages: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=220&q=80",
    ],
    emailImages: [
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=220&q=80",
    ],
    insight: "Low ad count but strong catalog depth; email drops matter more than paid spend here.",
  },
  {
    id: 4,
    name: "Obvious State",
    domain: "obviousstate.com",
    logoUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=80",
    storefrontUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=640&q=80",
    category: "Home & Gifts",
    country: "CA",
    currency: "USD",
    monthlyVisits: "22K",
    metaAds: 0,
    liveAds: 9,
    products: 110,
    trustpilot: "4.6",
    traffic: [22, 24, 19, 31, 27, 35, 23, 30],
    adTrend: [44, 40, 38, 31, 28, 21, 16, 9],
    bestSellers: [
      "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=220&q=80",
    ],
    adImages: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=220&q=80",
    ],
    emailImages: [
      "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=220&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=220&q=80",
    ],
    insight: "Traffic is stable while ads are quiet, a good target for organic or email research.",
  },
];

export const creativeBrief = [
  "Lead with a visible transformation in the first two seconds.",
  "Use routine-based hooks for repeat-purchase categories.",
  "Show the product in a real room, gym bag or bathroom counter.",
  "Test one founder-demo angle against one creator POV angle.",
];

export function buildAnalystResult(prompt: string): AnalystResult {
  const normalizedPrompt = prompt.trim() || "Find a product angle for recovery and sleep buyers";
  const topic = normalizedPrompt.toLowerCase();
  const isPet = topic.includes("pet") || topic.includes("dog") || topic.includes("cat");
  const isBeauty = topic.includes("beauty") || topic.includes("curl") || topic.includes("spf");

  if (isPet) {
    return {
      prompt: normalizedPrompt,
      response:
        "Pet odor and enrichment products are the strongest near-term opportunity. Buyer intent is practical, content is highly visual, and repeat-purchase potential is clear.",
      plan: [
        "Lead with apartment-friendly problem solving instead of broad pet wellness.",
        "Bundle filters or trays with a 30-day routine guide.",
        "Test creator videos around smell checks, calm routines and owner relief.",
        "Retarget viewers with reviews from small-space pet owners.",
      ],
    };
  }

  if (isBeauty) {
    return {
      prompt: normalizedPrompt,
      response:
        "Portable beauty routines are moving fastest. The winning angle is low-effort transformation: small products, visible results and daily carry behavior.",
      plan: [
        "Position the offer around fast visible results with less damage or friction.",
        "Create before/after videos with a clear timestamp and close-up proof.",
        "Bundle with a travel pouch or routine card to lift perceived value.",
        "Retarget engaged viewers with ingredient or durability proof.",
      ],
    };
  }

  return {
    prompt: normalizedPrompt,
    response:
      "Recovery gummies are the strongest near-term angle. Demand is moving through creator routines, buyer intent is high, and ad saturation is still moderate outside the biggest brands.",
    plan: [
      "Position the offer around next-day energy instead of generic recovery.",
      "Bundle a 30-day supply with a sleep-tracking challenge.",
      "Launch three UGC concepts: gym bag routine, bedtime stack and soreness myth-busting.",
      "Retarget viewers with a comparison page against magnesium capsules.",
    ],
  };
}
