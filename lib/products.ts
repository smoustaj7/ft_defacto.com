import { db, Product } from "./db";

export type ProductFilters = {
  category?: string;
  subcategory?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "bestseller";
  q?: string;
};

export type ProductInput = {
  name: string;
  category: string;
  subcategory: string;
  price: number;
  compare_at_price?: number | null;
  description: string;
  color_name: string;
  color_hex: string;
  image_url?: string;
  sizes?: string[];
  is_new?: boolean;
  is_bestseller?: boolean;
};

export function getProductById(id: number): Product | undefined {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | undefined;
}

export function getProducts(filters: ProductFilters = {}): Product[] {
  const clauses: string[] = [];
  const params: Record<string, string> = {};

  if (filters.category) {
    clauses.push("category = @category");
    params.category = filters.category;
  }
  if (filters.subcategory) {
    clauses.push("subcategory = @subcategory");
    params.subcategory = filters.subcategory;
  }
  if (filters.q) {
    clauses.push("(name LIKE @q OR description LIKE @q)");
    params.q = `%${filters.q}%`;
  }

  let orderBy = "created_at DESC";
  if (filters.sort === "price-asc") orderBy = "price ASC";
  else if (filters.sort === "price-desc") orderBy = "price DESC";
  else if (filters.sort === "bestseller") orderBy = "is_bestseller DESC, created_at DESC";
  else if (filters.sort === "newest") orderBy = "is_new DESC, created_at DESC";

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `SELECT * FROM products ${where} ORDER BY ${orderBy}`;

  return db.prepare(sql).all(params) as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  return db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as
    | Product
    | undefined;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";
}

function generateUniqueSlug(baseName: string, excludeId?: number) {
  let slug = slugify(baseName);
  let suffix = 2;

  while (true) {
    const existing = excludeId
      ? db
          .prepare("SELECT id FROM products WHERE slug = ? AND id != ?")
          .get(slug, excludeId) as { id?: number } | undefined
      : db
          .prepare("SELECT id FROM products WHERE slug = ?")
          .get(slug) as { id?: number } | undefined;

    if (!existing) break;
    slug = `${slugify(baseName)}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function createProduct(input: ProductInput): Product {
  const normalizedName = input.name.trim();
  const normalizedCategory = input.category.trim();
  const normalizedSubcategory = input.subcategory.trim();

  if (!normalizedName || !normalizedCategory || !normalizedSubcategory) {
    throw new Error("Product name, category, and subcategory are required");
  }

  const sizeList = Array.isArray(input.sizes) && input.sizes.length > 0
    ? input.sizes.map((size) => String(size).trim()).filter(Boolean)
    : ["S", "M", "L"];

  const result = db.prepare(`
    INSERT INTO products (
      slug, name, category, subcategory, price, compare_at_price,
      description, color_name, color_hex, image_url, sizes,
      is_new, is_bestseller
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    generateUniqueSlug(normalizedName),
    normalizedName,
    normalizedCategory,
    normalizedSubcategory,
    Number(input.price || 0),
    input.compare_at_price ?? null,
    input.description?.trim() || "A new addition to the Defacto collection.",
    input.color_name?.trim() || "Neutral",
    input.color_hex || "#EAE2D7",
    input.image_url || `/products/${slugify(normalizedName)}.svg`,
    JSON.stringify(sizeList),
    input.is_new ? 1 : 0,
    input.is_bestseller ? 1 : 0,
  );

  const created = getProductById(Number(result.lastInsertRowid));
  if (!created) {
    throw new Error("Unable to load created product");
  }

  return created;
}

export function deleteProduct(productId: number): boolean {
  db.prepare("DELETE FROM cart_items WHERE product_id = ?").run(productId);
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(productId);
  return result.changes > 0;
}

export function getSubcategories(category?: string): string[] {
  const sql = category
    ? "SELECT DISTINCT subcategory FROM products WHERE category = ?"
    : "SELECT DISTINCT subcategory FROM products";
  const rows = (category
    ? db.prepare(sql).all(category)
    : db.prepare(sql).all()) as { subcategory: string }[];
  return rows.map((r) => r.subcategory);
}

export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];
  
  // Normalize the query: lowercase, trim
  let q = query.toLowerCase().trim();
  
  // Very basic "stemming" - if it ends with 's', also search without it
  // (e.g. "t-shirts" -> "t-shirt")
  const qWithoutS = q.endsWith('s') ? q.slice(0, -1) : q;
  const qWithS = !q.endsWith('s') ? q + 's' : q;

  const sql = `
    SELECT * FROM products 
    WHERE 
      name LIKE @q OR 
      subcategory LIKE @q OR
      category LIKE @q OR
      name LIKE @qWithoutS OR
      subcategory LIKE @qWithoutS OR
      name LIKE @qWithS OR
      subcategory LIKE @qWithS
    ORDER BY is_bestseller DESC, created_at DESC
    LIMIT 8
  `;

  return db.prepare(sql).all({
    q: `%${q}%`,
    qWithoutS: `%${qWithoutS}%`,
    qWithS: `%${qWithS}%`
  }) as Product[];
}
