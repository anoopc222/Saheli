# Shopping Cart App

Next.js (App Router) storefront with a Supabase-backed product catalog and Razorpay Checkout for payments.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Supabase (Postgres) for products and orders
- Razorpay Checkout (cards, UPI, netbanking, wallets) for payments

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Fill in `.env.local` (already gitignored):
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — already set for this project's Supabase instance.
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → Project Settings → API → service_role key. Keep this secret, server-side only.
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from the Razorpay dashboard → Settings → API Keys.
   - `RAZORPAY_WEBHOOK_SECRET` — set when creating a webhook endpoint in the Razorpay dashboard for the `payment.captured` event, pointed at `/api/webhook`.
3. Run the dev server:
   ```
   npm run dev
   ```

## Deploying to Netlify

The repo includes `netlify.toml` (build command + the `@netlify/plugin-nextjs` runtime,
pinned as a devDependency). To deploy:

1. In the Netlify dashboard, "Add new site" → "Import an existing project" → pick this
   repo. Netlify reads `netlify.toml` automatically; no build settings need changing.
2. Under Site configuration → Environment variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (used by `/admin` login — see
     `src/lib/admin-auth.ts`)
3. Point your domain at the Netlify site (Domain management → Add a domain), then update
   the Razorpay webhook URL and any Supabase auth redirect URLs to the new domain.
4. Every push to the connected branch triggers a new build automatically.

## Data model

- `products` — catalog, publicly readable.
- `orders` / `order_items` — created by `/api/checkout` up front as `pending`, then flipped to `paid` (and stock decremented) by whichever of `/api/verify-payment` or `/api/webhook` observes the successful payment first.

## Flow

Browse products → add to cart (persisted in localStorage) → `/cart` → Checkout button goes to `/checkout` → shipping form + "Pay" creates a pending order and a Razorpay order via `/api/checkout`, then opens the Razorpay Checkout widget (cards/UPI/netbanking/wallets) → on success the client calls `/api/verify-payment` to check the payment signature and finalize the order → redirects to `/checkout/success`. A Razorpay webhook (`payment.captured`) is the authoritative fallback in case the client never gets back to verify.
