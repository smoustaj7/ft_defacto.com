import { Suspense } from "react";
import { getProducts, getSubcategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const subcategories = getSubcategories(category);
  
  // Use a string key based on search params to force Suspense to re-trigger on filter changes
  const suspenseKey = JSON.stringify(sp);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="display-heading text-3xl md:text-4xl capitalize">
          {category ? category : "All Products"}
        </h1>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        <aside className="md:sticky md:top-24 md:self-start">
          <Suspense fallback={null}>
            <ProductFilters subcategories={subcategories} />
          </Suspense>
        </aside>

        <section>
          <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={sp} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function ProductGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const subcategory = typeof searchParams.subcategory === "string" ? searchParams.subcategory : undefined;
  const sort = typeof searchParams.sort === "string" ? (searchParams.sort as any) : "newest";
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const saleOnly = searchParams.sale === "1";

  // Simulate a slight delay to show the skeleton (since SQLite is so fast locally)
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  let products = getProducts({ category, subcategory, sort, q });
  if (saleOnly) {
    products = products.filter(
      (p) => p.compare_at_price && p.compare_at_price > p.price
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-medium mb-2">No items match these filters</p>
        <p className="text-sm text-ink-soft">
          Try clearing a filter or searching for something else.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-ink-soft mb-6 -mt-10">
        {products.length} {products.length === 1 ? "item" : "items"}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

function ProductGridSkeleton() {
  return (
    <>
      <div className="w-16 h-5 bg-line/50 rounded animate-pulse mb-6 -mt-10"></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] bg-line/50 rounded-md mb-4" />
            <div className="h-4 bg-line/50 rounded w-3/4 mb-2" />
            <div className="h-4 bg-line/50 rounded w-1/4" />
          </div>
        ))}
      </div>
    </>
  );
}
