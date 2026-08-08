# Defacto Redesign — Project Roadmap

## What's already built (backend — done, don't touch without reason)

The backend is a real, working system — not mocked responses. It lives in `lib/` and `app/api/`.

```
lib/db.ts          → SQLite schema + seed data (products, cart_items, orders)
lib/products.ts    → getProducts(filters), getProductBySlug(), getSubcategories()
lib/cart.ts        → getCart(), addToCart(), updateCartItem(), removeCartItem(), cartTotals()
lib/orders.ts      → getOrderById()
lib/session.ts     → guest session via httpOnly cookie (no auth system needed)
app/api/cart/route.ts     → GET / POST / PATCH / DELETE
app/api/checkout/route.ts → POST → validates cart, writes an order, clears cart
```

**Why it's built this way (the parts worth understanding, not just using):**

- **Session-based cart, no auth.** Every visitor gets a random UUID in an `httpOnly` cookie the first time they hit any route that calls `getOrCreateSessionId()`. The cart table is keyed on that ID. This is how most real storefronts handle guest carts — you only force login at checkout, if ever.
- **SQLite via `better-sqlite3` is synchronous.** No `await db.query(...)` — calls just return. That's a deliberate choice for a project this size: no connection pool complexity, and the whole DB is one file (`data/app.db`) you can inspect with any SQLite browser. It won't scale to concurrent writers under real load, but for the assessment/build stage it's the right tool.
- **`cartTotals()` computes shipping server-side** (free over 500 MAD, else 39 MAD flat), not in the frontend. Money math should never live in a component — the frontend just displays what the backend computed. This is the single most important habit to carry into other projects: **never trust or duplicate a price calculation on the client.**
- **Checkout is one API call that does three things atomically-ish:** validates the form, snapshots the cart items as JSON into the `orders` row (so a later price change doesn't retroactively alter a past order), then clears the cart. That snapshot pattern is worth remembering — it's why real orders show what you paid, not what the item costs today.

If you extend the backend yourself, the things to preserve: sessions stay cookie-based, totals stay server-computed, orders stay immutable snapshots.

---

## What exists as a rough first pass (frontend — treat as scaffolding, not final)

I built working pages (`app/page.tsx`, `app/products/`, `app/cart/`, `app/checkout/`) to prove the backend end-to-end. They're functional but not what you should ship — think of them as the frontend equivalent of a `curl` test. Use them as a wiring reference (how a page calls `/api/cart`, how filters update the URL) but feel free to have another model rebuild the actual UI from the phases below.

**Design tokens are already decided** (`app/globals.css`) — keep these no matter which model does the visual work, so the site stays coherent:

- Palette: white ground (`--color-paper`), near-black ink text, a saturated red `--color-signal` reserved for CTAs/sale/price, plus one accent per department (`--color-denim` men, `--color-clay` women, `--color-moss` kids)
- Signature element: `.tick-rule` — a tailor's-tape style divider (ticks of two densities) used as section breaks, the size-selector baseline, and (not yet built) a checkout progress indicator. It's meant to nod at garment measurement.
- No product photos exist yet — `components/ProductImage.tsx` + `GarmentIcon.tsx` render a colored block with a line-art garment sketch instead. This is intentional placeholder art, not a bug. Swap it for real photography in Phase 4 below.

---

## Roadmap for the rest

Each phase names a **learning goal** — the actual skill the phase is meant to teach, not just the output — so you can evaluate what another model gives you instead of just accepting it.

### Phase 1 — Visual QA pass on existing pages
**Learning goal:** reading generated UI critically instead of accepting it wholesale.
- Run `npm run dev`, walk through home → PLP → PDP → cart → checkout → confirmation on both desktop and a narrow mobile viewport.
- Write down every spot that feels cramped, misaligned, or where the tick-rule divider looks decorative instead of functional.
- Hand that list to whichever model does Phase 2 — don't let it "polish" blind.

### Phase 2 — Component-level UI refinement
**Learning goal:** how a design system (tokens + one signature element) constrains and speeds up UI work instead of you rebuilding from scratch each time.
- Rebuild `ProductCard`, `Navbar`, `AddToCartPanel` with tighter spacing, real hover/focus states, loading skeletons.
- Constraint to give the model: it must derive every color from the existing `@theme` tokens in `globals.css` — no new hex values invented ad hoc.

### Phase 3 — Mobile-first pass
**Learning goal:** the specific failure modes fast-fashion sites hit on mobile (per the research earlier: 80% of fashion buyers shop on mobile, and hidden filters/hamburger nav are the #1 named complaint about Zara specifically).
- Filters on `/products` are currently a static sidebar on mobile — they need a bottom-sheet or slide-over that's still one tap away, never nested in a hamburger.
- Checkout form fields need larger tap targets and correct `inputmode`/`autocomplete` attributes (`autocomplete="shipping street-address"`, `inputmode="email"`, etc.) so mobile keyboards adapt.

### Phase 4 — Real product photography
**Learning goal:** how placeholder-driven development lets you build the whole data flow before assets exist — then swap the visual layer without touching logic.
- Replace `ProductImage` with real photos once you have them (product photography, or AI-generated per-product images kept consistent in lighting/background).
- The `Product` type in `lib/db.ts` will need an `image_url` column — that's a real schema migration, a good small exercise in altering a SQLite table without losing seeded data.

### Phase 5 — Empty/error states and edge cases
**Learning goal:** the difference between a demo and a product — most AI-generated builds skip this entirely.
- What does an out-of-stock size look like? (Not currently modeled — sizes are just a flat list with no per-size inventory.)
- What happens if `/api/checkout` is hit with an expired session cookie?
- Search with zero results, a product with only one size, quantity at the max cap.

### Phase 6 — Deployment
**Learning goal:** the actual constraint SQLite creates in production.
- `better-sqlite3` writes to a local file — fine on a single server, broken on serverless (Vercel's filesystem is ephemeral/read-only per-invocation). Before deploying, you'll need to either move to a hosted Postgres (Neon, Supabase) or deploy to a persistent-disk host (Railway, Fly.io, a VPS).
- This is a good one to research yourself rather than delegate — it's a real architecture decision, not a styling task.

---

## How to hand this to another model

Paste the relevant phase section plus the actual files it touches (`lib/db.ts`, `app/globals.css`, and whichever page/component is in scope). Don't paste the whole repo — a focused diff is easier for any model to reason about correctly, and easier for you to review line by line, which is the whole point of doing this yourself.