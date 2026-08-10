import Link from "next/link";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

export default function HomePage() {
  const bestsellers = getProducts({ sort: "bestseller" }).slice(0, 4);
  const newIn = getProducts({ sort: "newest" }).slice(0, 6);

  // Representative images for category cards (falls back to color blocks)
  const menSample = getProducts({ category: "men" })[0];
  const womenSample = getProducts({ category: "women" })[0];
  const kidsSample = getProducts({ category: "kids" })[0];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <section className="bg-signal text-paper">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 sm:py-16 md:py-24 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <p className="text-xs sm:text-sm tracking-widest uppercase text-paper/75 mb-3 font-medium">
              Autumn Collection
            </p>
            <h1 className="display-heading text-4xl sm:text-5xl md:text-7xl leading-[0.95] mb-5 break-words">
              Made to
              <br />
              Move With You
            </h1>
            <p className="text-sm sm:text-base text-paper/90 max-w-md mb-6 leading-relaxed">
              Everyday clothing for men, women and kids. Solid fabrics, honest
              prices, and a store that gets out of your way.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 rounded-full font-medium text-sm hover:bg-ink/90 transition-colors"
            >
              Shop new arrivals
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            <ProductImage
              colorHex="#EFE6D8"
              subcategory={newIn[0]?.subcategory ?? "knitwear"}
              imageUrl={newIn[0]?.image_url}
              alt={newIn[0]?.name}
              className="aspect-[3/4] rounded-md translate-y-6"
            />
            <ProductImage
              colorHex="#1E1E1E"
              subcategory={bestsellers[0]?.subcategory ?? "outerwear"}
              imageUrl={bestsellers[0]?.image_url}
              alt={bestsellers[0]?.name}
              className="aspect-[3/4] rounded-md"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="tick-rule my-8 sm:my-10" />

        <section aria-labelledby="shop-by-category">
          <h2 id="shop-by-category" className="sr-only">
            Shop by category
          </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CategoryCard label="Men" href="/products?category=men" hex="#2F4A66" subcategory="shirts" imageUrl={menSample?.image_url} />
            <CategoryCard label="Women" href="/products?category=women" hex="#A54B3F" subcategory="dresses" imageUrl={womenSample?.image_url} />
            <CategoryCard label="Kids" href="/products?category=kids" hex="#E8C547" subcategory="t-shirts" imageUrl={kidsSample?.image_url} />
          </div>
        </section>

        <div className="tick-rule my-10 sm:my-14" />

        <section aria-labelledby="bestsellers">
          <div className="flex items-end justify-between mb-6">
            <h2 id="bestsellers" className="display-heading text-xl sm:text-2xl">
              Bestsellers
            </h2>
            <Link href="/products?sort=bestseller" className="text-sm font-medium hover:text-signal">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <div className="tick-rule my-10 sm:my-14" />

        <section aria-labelledby="new-in" className="pb-16 sm:pb-20">
          <div className="flex items-end justify-between mb-6">
            <h2 id="new-in" className="display-heading text-xl sm:text-2xl">
              New This Week
            </h2>
            <Link href="/products?sort=newest" className="text-sm font-medium hover:text-signal">
              View all
            </Link>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {newIn.map((p) => (
              <div key={p.id} className="w-40 sm:w-48 md:w-56 shrink-0 snap-start">
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
  imageUrl,
}: {
  label: string;
  href: string;
  hex: string;
  subcategory: string;
  imageUrl?: string;
}) {
  return (
    <Link href={href} className="group block relative rounded-md overflow-hidden">
      <ProductImage
        colorHex={hex}
        subcategory={subcategory}
        imageUrl={imageUrl}
        alt={label}
        className="aspect-[4/5] transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 display-heading text-2xl text-paper">
        {label}
      </div>
    </Link>
  );
}
