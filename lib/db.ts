import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Reuse a single connection across hot reloads in dev
const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db = globalForDb.db ?? new Database(DB_PATH);
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  oauth_provider TEXT DEFAULT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  full_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,      -- men | women | kids
  subcategory TEXT NOT NULL,   -- t-shirts | jeans | dresses | etc
  price REAL NOT NULL,
  compare_at_price REAL,
  description TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  sizes TEXT NOT NULL,         -- JSON array
  is_new INTEGER DEFAULT 0,
  is_bestseller INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  items TEXT NOT NULL,        -- JSON snapshot of purchased items
  subtotal REAL NOT NULL,
  shipping REAL NOT NULL,
  total REAL NOT NULL,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

function seedIfEmpty() {
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM products")
    .get() as { count: number };
  if (count > 0) return;

  const products = [
    // MEN
    { name: "Essential Crew Tee", category: "men", subcategory: "t-shirts", price: 89, compare: null, color: "Off White", hex: "#F2EFE9", sizes: ["XS","S","M","L","XL","XXL"], isNew: 1, bestseller: 1, desc: "A wardrobe staple cut from soft combed cotton jersey. Regular fit, reinforced neckline, holds its shape wash after wash." },
    { name: "Tapered Chino", category: "men", subcategory: "trousers", price: 249, compare: 299, color: "Sand", hex: "#C9B18C", sizes: ["28","30","32","34","36","38"], isNew: 0, bestseller: 1, desc: "A modern tapered chino in stretch cotton twill. Sits at the waist, tapers cleanly from thigh to ankle." },
    { name: "Straight Denim Jacket", category: "men", subcategory: "outerwear", price: 399, compare: null, color: "Mid Blue", hex: "#5A7A9C", sizes: ["S","M","L","XL"], isNew: 1, bestseller: 0, desc: "Classic trucker silhouette in rigid denim that softens with wear. Button front, chest pockets, adjustable waist tabs." },
    { name: "Oxford Long Sleeve Shirt", category: "men", subcategory: "shirts", price: 199, compare: null, color: "Sky Blue", hex: "#A9C4DE", sizes: ["S","M","L","XL","XXL"], isNew: 0, bestseller: 0, desc: "Breathable oxford weave with a soft button-down collar. Fits well under a sweater or worn open over a tee." },
    { name: "Relaxed Jogger", category: "men", subcategory: "trousers", price: 179, compare: null, color: "Charcoal", hex: "#4A4A4A", sizes: ["S","M","L","XL"], isNew: 0, bestseller: 1, desc: "Heavyweight fleece joggers with a tapered leg and ribbed cuffs. Built for everyday comfort." },
    { name: "Merino Crew Sweater", category: "men", subcategory: "knitwear", price: 349, compare: 419, color: "Forest Green", hex: "#3B5240", sizes: ["S","M","L","XL"], isNew: 1, bestseller: 0, desc: "Fine-gauge merino wool, breathable and temperature-regulating. Layers cleanly under a jacket." },
    // WOMEN
    { name: "Wrap Midi Dress", category: "women", subcategory: "dresses", price: 329, compare: null, color: "Terracotta", hex: "#C1633C", sizes: ["XS","S","M","L","XL"], isNew: 1, bestseller: 1, desc: "A flattering wrap silhouette in fluid crepe. Adjustable tie waist, midi length, fully lined." },
    { name: "High-Rise Straight Jeans", category: "women", subcategory: "jeans", price: 289, compare: 339, color: "Vintage Wash", hex: "#7C93AD", sizes: ["24","25","26","27","28","29","30","31"], isNew: 0, bestseller: 1, desc: "Rigid cotton denim with a high rise and straight leg. The one pair that goes with everything." },
    { name: "Cropped Knit Cardigan", category: "women", subcategory: "knitwear", price: 259, compare: null, color: "Cream", hex: "#EFE6D8", sizes: ["XS","S","M","L"], isNew: 1, bestseller: 0, desc: "Soft ribbed knit cropped at the waist. Button front, perfect layered over a slip dress or tee." },
    { name: "Tailored Blazer", category: "women", subcategory: "outerwear", price: 449, compare: null, color: "Black", hex: "#1E1E1E", sizes: ["XS","S","M","L","XL"], isNew: 0, bestseller: 1, desc: "Structured shoulders, single-button close, fully lined. Sharp enough for the office, easy enough for everything else." },
    { name: "Satin Slip Skirt", category: "women", subcategory: "skirts", price: 199, compare: 239, color: "Champagne", hex: "#E8D9B5", sizes: ["XS","S","M","L"], isNew: 1, bestseller: 0, desc: "Bias-cut satin with a fluid drape and side slit. Elasticated back for an easy fit." },
    { name: "Oversized Poplin Shirt", category: "women", subcategory: "shirts", price: 189, compare: null, color: "White", hex: "#FAFAF8", sizes: ["XS","S","M","L","XL"], isNew: 0, bestseller: 0, desc: "Crisp cotton poplin cut oversized. Wear buttoned up, open over a tank, or tied at the waist." },
    // KIDS
    { name: "Graphic Print Tee", category: "kids", subcategory: "t-shirts", price: 59, compare: null, color: "Yellow", hex: "#E8C547", sizes: ["2Y","3Y","4Y","5Y","6Y","8Y"], isNew: 1, bestseller: 1, desc: "Soft organic cotton tee with a playful print. Pre-shrunk, built for climbing trees." },
    { name: "Elastic Waist Jeans", category: "kids", subcategory: "jeans", price: 99, compare: 119, color: "Light Blue", hex: "#A7C2DB", sizes: ["2Y","3Y","4Y","5Y","6Y","8Y"], isNew: 0, bestseller: 1, desc: "Comfortable stretch denim with an elastic waistband for all-day play." },
    { name: "Hooded Fleece Jacket", category: "kids", subcategory: "outerwear", price: 149, compare: null, color: "Navy", hex: "#2C3E5C", sizes: ["2Y","3Y","4Y","5Y","6Y","8Y"], isNew: 1, bestseller: 0, desc: "Warm brushed fleece with a lined hood and kangaroo pocket. Machine washable." },
  ];

  const insert = db.prepare(`
    INSERT INTO products (slug, name, category, subcategory, price, compare_at_price, description, color_name, color_hex, image_url, sizes, is_new, is_bestseller)
    VALUES (@slug, @name, @category, @subcategory, @price, @compare, @desc, @color, @hex, @imageUrl, @sizes, @isNew, @bestseller)
  `);

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const insertMany = db.transaction((items: typeof products) => {
    for (const p of items) {
      const slug = slugify(p.name);
      insert.run({
        slug,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        compare: p.compare,
        desc: p.desc,
        color: p.color,
        hex: p.hex,
        imageUrl: `/products/${slug}.svg`,
        sizes: JSON.stringify(p.sizes),
        isNew: p.isNew,
        bestseller: p.bestseller,
      });
    }
  });

  insertMany(products);
}

function addImageUrlColumnIfMissing() {
  const columns = db
    .prepare("PRAGMA table_info(products)")
    .all() as { name: string }[];
  if (!columns.some((col) => col.name === "image_url")) {
    db.exec("ALTER TABLE products ADD COLUMN image_url TEXT NOT NULL DEFAULT '';");
  }
}

function addOauthProviderColumnIfMissing() {
  const columns = db
    .prepare("PRAGMA table_info(users)")
    .all() as { name: string }[];
  if (!columns.some((col) => col.name === "oauth_provider")) {
    db.exec("ALTER TABLE users ADD COLUMN oauth_provider TEXT DEFAULT NULL;");
  }
}

function addAdminColumnIfMissing() {
  const columns = db
    .prepare("PRAGMA table_info(users)")
    .all() as { name: string }[];
  if (!columns.some((col) => col.name === "is_admin")) {
    db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;");
  }
}

function populateImageUrls() {
  const rows = db
    .prepare("SELECT id, slug, image_url FROM products")
    .all() as { id: number; slug: string; image_url: string }[];
  const update = db.prepare("UPDATE products SET image_url = ? WHERE id = ?");
  const slugToPath = (slug: string) => `/products/${slug}.svg`;

  const transaction = db.transaction((items: typeof rows) => {
    for (const item of items) {
      if (!item.image_url) {
        update.run(slugToPath(item.slug), item.id);
      }
    }
  });

  transaction(rows);
}

addImageUrlColumnIfMissing();
addOauthProviderColumnIfMissing();
addAdminColumnIfMissing();
populateImageUrls();

seedIfEmpty();

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  sizes: string; // JSON
  is_new: number;
  is_bestseller: number;
  created_at: string;
};
