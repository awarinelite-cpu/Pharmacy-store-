# Pharmacy marketplace

Multi-vendor pharmacy app. Three interfaces:

- **Admin** (`/admin`) — approve/revoke vendors, oversee all products/orders/users
- **Vendor** (`/vendor`) — the seller/pharmacy interface: manage own inventory, fulfill own orders
- **Customer** (`/shop`) — browse products across all vendors, cart, checkout, order history

Each vendor manages independent stock (marketplace model, not a shared pool). Prescription-required
items are flagged but not gated behind upload/verification (kept simple per current scope).

## Stack

- SvelteKit (Svelte 5 runes) + TypeScript
- Firebase Auth (session-cookie based, via Admin SDK) + Firestore (accessed only server-side via
  Admin SDK — the client Firestore SDK is initialized but unused, see `firestore.rules`)
- Paystack for checkout
- Deploys to Vercel via `@sveltejs/adapter-vercel`

## Setup

1. `npm install`
2. Create a Firebase project. Enable **Authentication → Email/Password** and **Firestore**.
3. Generate a service account key (Project settings → Service accounts → Generate new private key)
   for the Admin SDK env vars.
4. Copy `.env.example` to `.env` and fill in your Firebase + Paystack keys.
5. Deploy Firestore rules/indexes: `firebase deploy --only firestore` (requires `firebase-tools` and
   `firebase login`).
6. **Create your first admin account manually** — public signup only allows `customer`/`vendor`
   roles by design. After creating a normal user, set their Firestore `users/{uid}.role` field to
   `"admin"` and set the matching custom claim:
   ```js
   await adminAuth.setCustomUserClaims(uid, { role: 'admin' });
   ```
   (Run this once via a small script with the Admin SDK, or temporarily allow `admin` in
   `/api/auth/register` for your own signup, then revert.)
7. `npm run dev`

## Deployment (Vercel)

- Connect the repo to Vercel, or `vercel deploy`.
- Set all `.env.example` variables in the Vercel project's Environment Variables settings.
  `FIREBASE_PRIVATE_KEY` needs literal `\n` for newlines when pasted as a single-line value — the
  code converts them back at runtime (`src/lib/server/firebase-admin.ts`).

## Data model

- `users/{uid}` — role (`admin|vendor|customer`), profile, and for vendors: `vendorApproved`
- `products/{id}` — owned by a `vendorId`, includes stock, price (stored in kobo), prescription flag
- `orders/{id}` — one order per vendor per checkout (a cart spanning multiple vendors creates
  multiple order docs sharing one Paystack reference)
- `inventory_logs/{id}` — audit trail for every stock change (manual adjustment or sale)

## Known gaps / next steps

- No prescription upload/verification flow yet
- No product images/storage upload UI (Storage is initialized but unused)
- No email notifications on order status changes
- Admin creation is manual (see step 6 above) — no super-admin bootstrap UI
