import Link from "next/link";
import { Product } from "@/lib/db";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-md overflow-hidden mb-3">
        <ProductImage
          colorHex={product.color_hex}
          subcategory={product.subcategory}
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          {product.is_new === 1 && (
            <span className="bg-ink text-paper text-[11px] font-medium px-2 py-1 rounded-sm">
              New
            </span>
          )}
          {onSale && (
            <span className="bg-signal text-paper text-[11px] font-medium px-2 py-1 rounded-sm">
              Sale
            </span>
          )}
        </div>
      </div>
      <div className="text-sm font-medium text-ink group-hover:text-signal transition-colors">
        {product.name}
      </div>
      <div className="text-xs text-ink-soft mb-1">{product.color_name}</div>
      <div className="flex items-center gap-2 text-sm">
        <span className={onSale ? "text-signal font-semibold" : "font-semibold"}>
          {product.price} MAD
        </span>
        {onSale && (
          <span className="text-ink-soft line-through text-xs">
            {product.compare_at_price} MAD
          </span>
        )}
      </div>
    </Link>
  );
}
