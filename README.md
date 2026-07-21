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
   - `CRON_SECRET` — any random string you choose (e.g. `openssl rand -hex 32`); required by `/api/cron/abandoned-cart-emails`, see below.
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
   - `CRON_SECRET` — see "Abandoned cart emails" below
3. Point your domain at the Netlify site (Domain management → Add a domain), then update
   the Razorpay webhook URL and any Supabase auth redirect URLs to the new domain.
4. Every push to the connected branch triggers a new build automatically.

## Abandoned cart emails

For a logged-in customer, the cart is mirrored to the `abandoned_carts` table on every
change (see `src/lib/cart-context.tsx`) and cleared when the cart empties. Nothing sends
on its own, though — Next.js has no built-in cron, so something outside the app has to
call `POST /api/cron/abandoned-cart-emails` on a schedule with:

```
Authorization: Bearer <CRON_SECRET>
```

It emails anyone whose cart has sat unchanged for 24+ hours and hasn't already gotten a
reminder for that cart, then marks it sent. Two ways to trigger it on Netlify:

- **Netlify Scheduled Functions** — add a function under `netlify/functions/` with a
  `schedule` export (e.g. hourly) that calls this route with the header above.
- **A free external cron** (e.g. [cron-job.org](https://cron-job.org)) hitting the full
  URL (`https://yourdomain.com/api/cron/abandoned-cart-emails`) with that header, once an
  hour or so.

Guest checkouts aren't tracked here — there's no email on file until checkout, so this
only applies to signed-in customers.

## Data model

- `products` — catalog, publicly readable.
- `orders` / `order_items` — created by `/api/checkout` up front as `pending`, then flipped to `paid` (and stock decremented) by whichever of `/api/verify-payment` or `/api/webhook` observes the successful payment first.

## Flow

Browse products → add to cart (persisted in localStorage) → `/cart` → Checkout button goes to `/checkout` → shipping form + "Pay" creates a pending order and a Razorpay order via `/api/checkout`, then opens the Razorpay Checkout widget (cards/UPI/netbanking/wallets) → on success the client calls `/api/verify-payment` to check the payment signature and finalize the order → redirects to `/checkout/success`. A Razorpay webhook (`payment.captured`) is the authoritative fallback in case the client never gets back to verify.

The moment an order first flips to `paid` (in `finalizePaidOrder`, see `src/lib/order-fulfillment.ts`), one order confirmation email goes out to the customer with the store's own notification address CC'd — a single send rather than two, so it only counts once against the email provider's quota. A failed send is logged but never blocks the payment confirmation itself.
