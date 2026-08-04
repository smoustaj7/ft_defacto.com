import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartPanel } from "@/components/AddToCartPanel";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const sizes: string[] = JSON.parse(product.sizes);
  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  const related = getProducts({ category: product.category })
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <nav className="text-sm text-ink-soft mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-ink capitalize">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div className="grid grid-cols-2 gap-3">
          <ProductImage
            colorHex={product.color_hex}
            subcategory={product.subcategory}
            className="col-span-2 aspect-[4/5] rounded-md"
          />
          <ProductImage
            colorHex={product.color_hex}
            subcategory={product.subcategory}
            className="aspect-square rounded-md opacity-90"
          />
          <ProductImage
            colorHex={product.color_hex}
            subcategory={product.subcategory}
            className="aspect-square rounded-md opacity-75"
          />
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <div className="flex items-center gap-2 mb-2">
            {product.is_new === 1 && (
              <span className="bg-ink text-paper text-[11px] font-medium px-2 py-1 rounded-sm">New</span>
            )}
            {onSale && (
              <span className="bg-signal text-paper text-[11px] font-medium px-2 py-1 rounded-sm">Sale</span>
            )}
          </div>
          <h1 className="display-heading text-3xl md:text-4xl mb-2">{product.name}</h1>
          <p className="text-sm text-ink-soft mb-4">{product.color_name}</p>
          <div className="flex items-center gap-3 mb-6">
            <span className={`text-2xl font-semibold ${onSale ? "text-signal" : ""}`}>
              {product.price} MAD
            </span>
            {onSale && (
              <span className="text-ink-soft line-through">
                {product.compare_at_price} MAD
              </span>
            )}
          </div>

          <p className="text-sm text-ink-soft leading-relaxed mb-8 max-w-md">
            {product.description}
          </p>

          <AddToCartPanel productId={product.id} sizes={sizes} />

          <div className="tick-rule my-8" />
          <dl className="text-sm space-y-2 text-ink-soft">
            <div className="flex justify-between">
              <dt>Free shipping</dt>
              <dd>On orders over 500 MAD</dd>
            </div>
            <div className="flex justify-between">
              <dt>Returns</dt>
              <dd>Within 30 days</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="tick-rule mb-8" />
          <h2 className="display-heading text-2xl mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
