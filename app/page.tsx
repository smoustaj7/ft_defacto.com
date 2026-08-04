import Link from "next/link";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

export default function HomePage() {
  const bestsellers = getProducts({ sort: "bestseller" }).slice(0, 4);
  const newIn = getProducts({ sort: "newest" }).slice(0, 6);

  return (
    <div>
      <section className="bg-signal text-paper">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm tracking-widest uppercase text-paper/70 mb-4">
              Autumn Collection
            </p>
            <h1 className="display-heading text-5xl md:text-7xl leading-[0.95] mb-6">
              Made to
              <br />
              Move With You
            </h1>
            <p className="text-paper/85 max-w-md mb-8">
              Everyday clothing for men, women and kids. Solid fabrics, honest
              prices, and a store that gets out of your way.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 rounded-full font-medium hover:bg-ink/90 transition-colors"
            >
              Shop new arrivals
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            <ProductImage
              colorHex="#EFE6D8"
              subcategory="knitwear"
              className="aspect-[3/4] rounded-md translate-y-6"
            />
            <ProductImage
              colorHex="#1E1E1E"
              subcategory="outerwear"
              className="aspect-[3/4] rounded-md"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="tick-rule my-10" />

        <section aria-labelledby="shop-by-category">
          <h2 id="shop-by-category" className="sr-only">
            Shop by category
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <CategoryCard label="Men" href="/products?category=men" hex="#2F4A66" subcategory="shirts" />
            <CategoryCard label="Women" href="/products?category=women" hex="#A54B3F" subcategory="dresses" />
            <CategoryCard label="Kids" href="/products?category=kids" hex="#E8C547" subcategory="t-shirts" />
          </div>
        </section>

        <div className="tick-rule my-14" />

        <section aria-labelledby="bestsellers">
          <div className="flex items-end justify-between mb-6">
            <h2 id="bestsellers" className="display-heading text-2xl">
              Bestsellers
            </h2>
            <Link href="/products?sort=bestseller" className="text-sm font-medium hover:text-signal">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <div className="tick-rule my-14" />

        <section aria-labelledby="new-in" className="pb-20">
          <div className="flex items-end justify-between mb-6">
            <h2 id="new-in" className="display-heading text-2xl">
              New This Week
            </h2>
            <Link href="/products?sort=newest" className="text-sm font-medium hover:text-signal">
              View all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x pb-2">
            {newIn.map((p) => (
              <div key={p.id} className="w-44 md:w-56 shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CategoryCard({
  label,
  href,
  hex,
  subcategory,
}: {
  label: string;
  href: string;
  hex: string;
  subcategory: string;
}) {
  return (
    <Link href={href} className="group block relative rounded-md overflow-hidden">
      <ProductImage
        colorHex={hex}
        subcategory={subcategory}
        className="aspect-[4/5] transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 display-heading text-2xl text-paper">
        {label}
      </div>
    </Link>
  );
}
