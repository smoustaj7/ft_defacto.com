import { db, Product } from "./db";

export type ProductFilters = {
  category?: string;
  subcategory?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "bestseller";
  q?: string;
};

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
