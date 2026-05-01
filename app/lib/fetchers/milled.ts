export type MilledEmail = {
  brand: string;
  subject: string;
  image_url: string | null;
  milled_url: string;
};

const BRANDS = [
  "gymshark",
  "obvi",
  "beardbrand",
  "pura-vida-bracelets",
  "ridge",
  "cuts-clothing",
  "display-purposes",
  "mvmt",
  "chubbies",
  "allbirds",
];

async function fetchBrandEmails(brand: string): Promise<MilledEmail[]> {
  const url = `https://milled.com/${brand}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) return [];

  const html = await response.text();
  const emails: MilledEmail[] = [];

  // Extract email previews from Milled brand page
  const emailRegex = /href="(\/[^"]+\/[^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<div[^>]*class="[^"]*subject[^"]*"[^>]*>([^<]+)</g;
  let match;

  while ((match = emailRegex.exec(html)) !== null && emails.length < 3) {
    emails.push({
      brand: brand.replace(/-/g, " "),
      subject: match[3].trim(),
      image_url: match[2],
      milled_url: `https://milled.com${match[1]}`,
    });
  }

  // Fallback: grab any thumbnails on the page
  if (emails.length === 0) {
    const imgRegex = /href="(\/[^/]+\/[^"]+)"[^>]*>[\s\S]{0,200}?<img[^>]+src="(https:\/\/[^"]+milled[^"]+)"/g;
    while ((match = imgRegex.exec(html)) !== null && emails.length < 2) {
      emails.push({
        brand: brand.replace(/-/g, " "),
        subject: `${brand} email`,
        image_url: match[2],
        milled_url: `https://milled.com${match[1]}`,
      });
    }
  }

  return emails;
}

export async function fetchMilledEmails(): Promise<MilledEmail[]> {
  const results = await Promise.allSettled(BRANDS.map(fetchBrandEmails));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
