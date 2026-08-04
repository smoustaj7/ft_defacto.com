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
