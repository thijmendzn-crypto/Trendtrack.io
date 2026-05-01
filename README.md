# SignalPilot / Trendtrack.io

Next.js MVP for an e-commerce trend intelligence SaaS.

## What works now

- Clerk sign-in/sign-up pages with Google/Gmail support when enabled in Clerk
- Shops intelligence dashboard with filters, product images, ad images and email creative slots
- Ads, email, trends, AI assistant and billing screens
- API-backed app state through Next.js Route Handlers
- Local file-backed persistence for watchlist, leads, checkout sessions and store connection
- Supabase-ready persistence when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured
- AI assistant endpoint at `/api/assistant`, using `GROQ_API_KEY` first, `OPENAI_API_KEY` second and local fallback logic otherwise
- Demo AI analyst responses via `/api/analyst`
- Demo checkout session creation via `/api/checkout`
- Health endpoint at `/api/health`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local` when adding real services.

Next production steps:

- Enable Google in the Clerk dashboard and add the Clerk env vars to Vercel
- Run `supabase/schema.sql` in Supabase SQL editor and add the Supabase env vars
- Replace demo shop/media data with real data sources for storefront images, Meta ads and email archives
- Replace demo checkout with Stripe Checkout
- Add `GROQ_API_KEY` or `OPENAI_API_KEY` to Vercel for the AI assistant
- Deploy to Vercel and set environment variables
