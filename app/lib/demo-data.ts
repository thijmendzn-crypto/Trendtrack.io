import type { Ad, AnalystResult, Signal } from "./types";

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
