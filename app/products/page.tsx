import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { getSubcategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const subcategory = typeof sp.subcategory === "string" ? sp.subcategory : undefined;
  const sort = typeof sp.sort === "string" ? (sp.sort as any) : "newest";
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const saleOnly = sp.sale === "1";

  let products = getProducts({ category, subcategory, sort, q });
  if (saleOnly) {
    products = products.filter(
      (p) => p.compare_at_price && p.compare_at_price > p.price
    );
  }

  const subcategories = getSubcategories(category);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="display-heading text-3xl md:text-4xl">
          {category ? category : "All Products"}
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        <aside className="md:sticky md:top-24 md:self-start">
          <Suspense fallback={null}>
            <ProductFilters subcategories={subcategories} />
          </Suspense>
        </aside>

        <section>
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-medium mb-2">No items match these filters</p>
              <p className="text-sm text-ink-soft">
                Try clearing a filter or searching for something else.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
