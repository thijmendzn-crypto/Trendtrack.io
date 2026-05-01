# SignalPilot / Trendtrack.io

Next.js MVP for an e-commerce trend intelligence SaaS.

## What works now

- Dashboard, signal explorer, ad library, AI analyst and billing screens
- API-backed app state through Next.js Route Handlers
- Local file-backed persistence for watchlist, leads, checkout sessions and store connection
- Demo AI analyst responses via `/api/analyst`
- Demo checkout session creation via `/api/checkout`
- Health endpoint at `/api/health`

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Verify

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local` when adding real services.

Next production steps:

- Add Clerk for real login/signup
- Replace `.data/store.json` with Postgres/Supabase/Neon
- Replace demo checkout with Stripe Checkout
- Replace demo analyst with OpenAI API
- Deploy to Vercel and set environment variables
