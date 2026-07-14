# Shopping Cart App

Next.js (App Router) storefront with a Supabase-backed product catalog and Stripe Checkout for payments.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Supabase (Postgres) for products and orders
- Stripe Checkout (test mode) for payments

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Fill in `.env.local` (already gitignored):
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — already set for this project's Supabase instance.
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → Project Settings → API → service_role key. Keep this secret, server-side only.
   - `STRIPE_SECRET_KEY` — from Stripe dashboard → Developers → API keys, use a `sk_test_...` key.
   - `STRIPE_WEBHOOK_SECRET` — run `stripe listen --forward-to localhost:3000/api/webhook` locally and copy the `whsec_...` it prints, or create a webhook endpoint in the Stripe dashboard for `checkout.session.completed`.
3. Run the dev server:
   ```
   npm run dev
   ```

## Data model

- `products` — catalog, publicly readable.
- `orders` / `order_items` — created by the `/api/webhook` route once Stripe confirms payment.

## Flow

Browse products → add to cart (persisted in localStorage) → `/cart` → Checkout button calls `/api/checkout` to create a Stripe Checkout Session → Stripe redirects to `/checkout/success` or `/checkout/cancel` → Stripe webhook (`checkout.session.completed`) records the order and decrements stock.
