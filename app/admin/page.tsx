import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProducts } from "@/lib/products";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.is_admin) {
    redirect("/account");
  }

  const products = getProducts({ sort: "newest" });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Admin</p>
          <h1 className="display-heading text-3xl md:text-4xl mt-2">Product management</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/account" className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-bone transition-colors">
            Back to account
          </Link>
          <Link href="/admin/new" className="rounded-full bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors">
            Add product
          </Link>
        </div>
      </div>

      <section className="border border-line rounded-xl overflow-hidden bg-paper">
        <div className="px-5 py-4 border-b border-line bg-bone/20 flex items-center justify-between">
          <h2 className="font-medium">Inventory</h2>
          <span className="text-sm text-ink-soft">{products.length} products</span>
        </div>

        <div className="divide-y divide-line">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="h-16 w-16 rounded-md border border-line overflow-hidden bg-bone"
                  style={{ backgroundColor: product.color_hex }}
                >
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-sm text-ink-soft">
                    {product.category} / {product.subcategory}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-ink-soft">
                  {product.price} MAD
                </div>
                <Link href={`/products/${product.slug}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-bone transition-colors">
                  Preview
                </Link>
                <form action="app/api/admin/products" method="post">
                  <input type="hidden" name="_method" value="delete" />
                  <input type="hidden" name="productId" value={String(product.id)} />
                  <button
                    type="submit"
                    className="rounded-full border border-signal text-signal px-3 py-1.5 text-sm hover:bg-signal/5 transition-colors"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
