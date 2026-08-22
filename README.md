# Defacto Redesign

A responsive redesign of a clothing brand storefront for men, women, and kids. The project combines a product catalogue, search and filters, product details, a session-based cart, checkout, customer accounts, and a small SQLite backend in one Next.js application.

The visual direction is intentionally editorial and practical: a high-contrast palette, garment-inspired measurement rules, clear product browsing, and a mobile-friendly shopping flow. Product artwork is currently represented by local placeholder illustrations in `public/products/`.

## What You Can Do

- Browse new arrivals and bestsellers from the home page
- Filter and search products by department, category, price, and sort order
- Open product detail pages and choose a size and quantity
- Add products to a guest cart and update or remove items
- Create an account, sign in, sign out, or optionally use Google OAuth
- Complete checkout with server-calculated totals
- View the confirmation page and account order history

Shipping is calculated on the server: orders over 500 MAD ship free, and smaller orders use a flat 39 MAD shipping fee.

## Tech Stack

- [Next.js 16](https://nextjs.org/) App Router
- React 19 and TypeScript
- SQLite through [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
- Tailwind CSS 4
- Zustand for client-side cart state
- Cookie-based sessions for guest carts and authentication

## Getting Started

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The first request creates the `data/` directory, initializes `data/app.db`, and seeds the sample catalogue. The database is local and should not be committed to source control.

### Optional Google sign-in

Email/password registration works without extra configuration. To enable Google sign-in, create `.env.local` with:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

The redirect URI must also be registered in the Google OAuth client settings. Keep `.env.local` private and never commit credentials.

## Useful Routes

| Route | Purpose |
| --- | --- |
| `/` | Storefront home page |
| `/products` | Catalogue, search, filters, and sorting |
| `/products/[slug]` | Product details and add-to-cart flow |
| `/cart` | Current session cart |
| `/checkout` | Shipping details and order submission |
| `/checkout/confirmation` | Completed order confirmation |
| `/login` | Customer sign-in |
| `/register` | Customer registration |
| `/account` | Account and order history |

The cart and checkout API endpoints live under `/api/cart` and `/api/checkout`. Authentication endpoints are under `/api/auth/`.

## Project Structure

```text
app/          Pages, layouts, and API route handlers
components/   Shared storefront UI components
lib/          Database, products, cart, orders, sessions, and auth logic
public/       Product artwork and other static assets
data/         Local SQLite database created at runtime
```

## Scripts

```bash
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run start    # Serve the production build
```

## Deployment Note

The current backend writes to a local SQLite file. That works well for local development and a single persistent server, but it is not suitable for standard serverless hosting with an ephemeral filesystem. Before deploying to a platform such as Vercel, move the database to a hosted persistent database or use a host with persistent storage.

## License

This is a private redesign project for learning and portfolio development.
