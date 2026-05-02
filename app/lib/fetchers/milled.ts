export type MilledEmail = {
  brand: string;
  subject: string;
  image_url: string | null;
  milled_url: string;
};

const BRANDS = [
  "gymshark",
  "allbirds",
  "casper",
  "mvmt",
  "ridge",
  "chubbies",
  "bombas",
  "mejuri",
  "brooklinen",
  "beardbrand",
];

async function fetchReallyGoodEmails(brand: string): Promise<MilledEmail[]> {
  const url = `https://reallygoodemails.com/brands/${brand}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    const emails: MilledEmail[] = [];

    // Extract email cards from Really Good Emails
    const cardRegex = /href="(\/emails\/[^"]+)"[^>]*>[\s\S]{0,500}?<img[^>]+src="([^"]+)"[^>]*>[\s\S]{0,300}?<[^>]*>([^<]{5,80})<\//g;
    let match;

    while ((match = cardRegex.exec(html)) !== null && emails.length < 3) {
      emails.push({
        brand,
        subject: match[3].trim(),
        image_url: match[2].startsWith("http") ? match[2] : null,
        milled_url: `https://reallygoodemails.com${match[1]}`,
      });
    }

    // Fallback: just grab images
    if (emails.length === 0) {
      const imgRegex = /href="(\/emails\/[^"]+)"[\s\S]{0,200}?<img[^>]+src="(https:\/\/[^"]+)"/g;
      while ((match = imgRegex.exec(html)) !== null && emails.length < 2) {
        emails.push({
          brand,
          subject: `${brand} email`,
          image_url: match[2],
          milled_url: `https://reallygoodemails.com${match[1]}`,
        });
      }
    }

    return emails;
  } catch {
    return [];
  }
}

export async function fetchMilledEmails(): Promise<MilledEmail[]> {
  const results = await Promise.allSettled(BRANDS.map(fetchReallyGoodEmails));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
