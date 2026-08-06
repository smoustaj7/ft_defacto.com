import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const products = searchProducts(q);

  // Group by subcategories from the results to suggest category links
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.subcategory] = (acc[p.subcategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([subcat, count]) => ({
      name: subcat,
      count,
    }));

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      subcategory: p.subcategory,
      color_name: p.color_name,
    })),
    categories,
  });
}
