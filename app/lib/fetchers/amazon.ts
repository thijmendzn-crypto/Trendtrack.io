export type AmazonProduct = {
  name: string;
  category: string;
  rank: number;
};

const CATEGORIES = [
  { name: "Beauty", path: "beauty" },
  { name: "Fitness", path: "sporting-goods" },
  { name: "Home", path: "home-garden" },
  { name: "Pets", path: "pet-supplies" },
  { name: "Tech", path: "electronics" },
];

async function fetchCategory(category: { name: string; path: string }): Promise<AmazonProduct[]> {
  const url = `https://www.amazon.com/Best-Sellers-${category.path}/zgbs/${category.path}/`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) return [];

  const html = await response.text();
  const products: AmazonProduct[] = [];

  // Extract product titles from Amazon best sellers page
  const titleRegex = /class="p13n-sc-truncate[^"]*"[^>]*>([^<]{10,80})</g;
  let match;
  let rank = 1;

  while ((match = titleRegex.exec(html)) !== null && rank <= 10) {
    const name = match[1].trim().replace(/\s+/g, " ");
    if (name.length > 10) {
      products.push({ name, category: category.name, rank });
      rank++;
    }
  }

  return products;
}

export async function fetchAmazonTrends(): Promise<AmazonProduct[]> {
  const results = await Promise.allSettled(CATEGORIES.map(fetchCategory));
  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}
