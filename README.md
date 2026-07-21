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
   - `RESEND_API_KEY` — from [resend.com](https://resend.com) → API Keys, for the order confirmation email sent when an order is paid.
   - `ORDER_EMAIL_FROM` — the "from" address for that email (e.g. `orders@yourdomain.com`). Requires verifying your domain in Resend; until then, sending is skipped (no `ORDER_EMAIL_FROM` set) or you can use a Resend test address.
   - `STORE_NOTIFICATION_EMAIL` (optional) — CC'd on every order confirmation so you're notified too, without sending a second email.
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
   - `RESEND_API_KEY`, `ORDER_EMAIL_FROM`, `STORE_NOTIFICATION_EMAIL` (optional) —
     order confirmation email
3. Point your domain at the Netlify site (Domain management → Add a domain), then update
   the Razorpay webhook URL and any Supabase auth redirect URLs to the new domain.
4. Every push to the connected branch triggers a new build automatically.

## Data model

- `products` — catalog, publicly readable.
- `orders` / `order_items` — created by `/api/checkout` up front as `pending`, then flipped to `paid` (and stock decremented) by whichever of `/api/verify-payment` or `/api/webhook` observes the successful payment first.

## Flow

Browse products → add to cart (persisted in localStorage) → `/cart` → Checkout button goes to `/checkout` → shipping form + "Pay" creates a pending order and a Razorpay order via `/api/checkout`, then opens the Razorpay Checkout widget (cards/UPI/netbanking/wallets) → on success the client calls `/api/verify-payment` to check the payment signature and finalize the order → redirects to `/checkout/success`. A Razorpay webhook (`payment.captured`) is the authoritative fallback in case the client never gets back to verify.

The moment an order first flips to `paid` (in `finalizePaidOrder`, see `src/lib/order-fulfillment.ts`), one order confirmation email goes out to the customer with the store's own notification address CC'd — a single send rather than two, so it only counts once against the email provider's quota. A failed send is logged but never blocks the payment confirmation itself.
