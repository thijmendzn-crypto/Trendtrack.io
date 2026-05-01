export type ShopData = {
  domain: string;
  name: string;
  category: string;
  country: string;
  currency: string;
  products: number;
  bestSellers: string[];
  logoUrl: string;
  storefrontUrl: string;
  insight: string;
};

// Seed list of known real Shopify stores per niche
const SEED_STORES: Array<{ domain: string; category: string; country: string }> = [
  // Beauty & Skincare
  { domain: "fentybeauty.com", category: "Beauty", country: "US" },
  { domain: "glossier.com", category: "Beauty", country: "US" },
  { domain: "tatcha.com", category: "Beauty", country: "US" },
  { domain: "juicycouture.com", category: "Beauty", country: "US" },
  { domain: "kyliecosmetics.com", category: "Beauty", country: "US" },
  // Fitness & Health
  { domain: "myobvi.com", category: "Fitness", country: "US" },
  { domain: "gymshark.com", category: "Fitness", country: "GB" },
  { domain: "alphalete.com", category: "Fitness", country: "US" },
  { domain: "vivolife.co.uk", category: "Fitness", country: "GB" },
  { domain: "mindbodygreen.com", category: "Fitness", country: "US" },
  // Fashion
  { domain: "fashionnova.com", category: "Fashion", country: "US" },
  { domain: "cutsclothing.com", category: "Fashion", country: "US" },
  { domain: "chubbies.com", category: "Fashion", country: "US" },
  { domain: "alo.com", category: "Fashion", country: "US" },
  { domain: "allbirds.com", category: "Fashion", country: "US" },
  // Home & Living
  { domain: "ridgewallet.com", category: "Home", country: "US" },
  { domain: "brooklinen.com", category: "Home", country: "US" },
  { domain: "casper.com", category: "Home", country: "US" },
  { domain: "parachutehome.com", category: "Home", country: "US" },
  // Pets
  { domain: "barkbox.com", category: "Pets", country: "US" },
  { domain: "wildearth.com", category: "Pets", country: "US" },
  { domain: "ruffwear.com", category: "Pets", country: "US" },
  // Food & Drinks
  { domain: "drinktrade.com", category: "Food & Drink", country: "US" },
  { domain: "athleticbrewing.com", category: "Food & Drink", country: "US" },
  { domain: "dailyharvest.com", category: "Food & Drink", country: "US" },
  // Tech & Gadgets
  { domain: "dbrand.com", category: "Tech", country: "CA" },
  { domain: "peak-design.com", category: "Tech", country: "US" },
  { domain: "casetify.com", category: "Tech", country: "US" },
  // Jewelry & Accessories
  { domain: "puravidabracelets.com", category: "Jewelry", country: "US" },
  { domain: "mejuri.com", category: "Jewelry", country: "CA" },
  { domain: "mvmt.com", category: "Jewelry", country: "US" },
  // Outdoor & Adventure
  { domain: "cotopaxi.com", category: "Outdoor", country: "US" },
  { domain: "tentree.com", category: "Outdoor", country: "CA" },
  { domain: "bombas.com", category: "Outdoor", country: "US" },
  // Kids & Baby
  { domain: "sollybabyco.com", category: "Kids", country: "US" },
  { domain: "lovevery.com", category: "Kids", country: "US" },
];

type ShopifyProductsResponse = {
  products?: Array<{
    title: string;
    images?: Array<{ src: string }>;
    variants?: Array<{ price: string }>;
  }>;
};

type ShopifyShopResponse = {
  shop?: {
    name: string;
    currency: string;
    country_code?: string;
  };
};

async function fetchShopifyData(store: { domain: string; category: string; country: string }): Promise<ShopData | null> {
  try {
    const [productsRes, shopRes] = await Promise.allSettled([
      fetch(`https://${store.domain}/products.json?limit=10`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://${store.domain}/`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    // Get products
    let products: ShopifyProductsResponse["products"] = [];
    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      const json = (await productsRes.value.json()) as ShopifyProductsResponse;
      products = json.products || [];
    }

    if (products.length === 0) return null;

    // Get storefront screenshot (first product image as preview)
    const bestSellers = products
      .slice(0, 4)
      .flatMap((p) => p.images?.map((img) => img.src) || [])
      .slice(0, 4);

    const storefrontUrl = bestSellers[0] || "";
    const logoUrl = bestSellers[0] || "";

    // Get shop name from HTML title
    let shopName = store.domain.replace(".com", "").replace(".co.uk", "");
    if (shopRes.status === "fulfilled" && shopRes.value.ok) {
      const html = await shopRes.value.text();
      const titleMatch = /<title>([^<|–-]{3,40})/i.exec(html);
      if (titleMatch) shopName = titleMatch[1].trim();
    }

    const avgPrice =
      products.reduce((sum, p) => {
        const price = parseFloat(p.variants?.[0]?.price || "0");
        return sum + price;
      }, 0) / products.length;

    const insight = `${products.length} products live. Average price $${avgPrice.toFixed(0)}. Active Shopify store in ${store.category.toLowerCase()}.`;

    return {
      domain: store.domain,
      name: shopName,
      category: store.category,
      country: store.country,
      currency: "USD",
      products: products.length,
      bestSellers,
      logoUrl,
      storefrontUrl,
      insight,
    };
  } catch {
    return null;
  }
}

export async function fetchShops(): Promise<ShopData[]> {
  const results: ShopData[] = [];

  // Fetch in batches of 5 to avoid overwhelming servers
  for (let i = 0; i < SEED_STORES.length; i += 5) {
    const batch = SEED_STORES.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(fetchShopifyData));
    results.push(...batchResults.filter((r): r is ShopData => r !== null));
  }

  return results;
}
