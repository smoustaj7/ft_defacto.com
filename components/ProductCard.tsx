import Link from "next/link";
import { Product } from "@/lib/db";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-md focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
    >
      <div className="relative aspect-[3/4] rounded-md overflow-hidden mb-2.5 bg-bone/40 border border-line/40 group-hover:border-line transition-colors">
        <ProductImage
          colorHex={product.color_hex}
          subcategory={product.subcategory}
          imageUrl={product.image_url}
          alt={product.name}
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute top-2 left-2 flex gap-1.5 z-10">
          {product.is_new === 1 && (
            <span className="bg-ink text-paper text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
              New
            </span>
          )}
          {onSale && (
            <span className="bg-signal text-paper text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
              Sale
            </span>
          )}
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-medium text-ink group-hover:text-signal transition-colors line-clamp-1">
          {product.name}
        </div>
        <div className="text-xs text-ink-soft">{product.color_name}</div>
        <div className="flex items-center gap-2 text-sm pt-0.5">
          <span className={onSale ? "text-signal font-semibold" : "font-semibold text-ink"}>
            {product.price} MAD
          </span>
          {onSale && (
            <span className="text-ink-soft line-through text-xs">
              {product.compare_at_price} MAD
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
