"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { notifyCartUpdated } from "@/lib/useCartCount";

type CartLine = {
  id: number;
  product_id: number;
  size: string;
  quantity: number;
  slug: string;
  name: string;
  price: number;
  color_name: string;
  color_hex: string;
  image_url: string;
};

type CartResponse = {
  items: CartLine[];
  totals: { subtotal: number; shipping: number; total: number };
};

// PDP already gives us subcategory per product; cart lines don't carry it,
// so we fall back to a generic tee silhouette for the swatch.
const FALLBACK_SUBCATEGORY = "t-shirts";

export default function CartPage() {
  const [data, setData] = useState<CartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Unable to load your bag. Please try again.");
      setData({ items: [], totals: { subtotal: 0, shipping: 0, total: 0 } });
      return;
    }
    setError(null);
    setData(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQuantity(itemId: number, quantity: number) {
    setBusyId(itemId);
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    setData(await res.json());
    notifyCartUpdated();
    setBusyId(null);
  }

  async function updateSize(itemId: number, size: string) {
    setBusyId(itemId);
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, size }),
    });
    setData(await res.json());
    setBusyId(null);
  }

  async function removeItem(itemId: number) {
    setBusyId(itemId);
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setData(await res.json());
    notifyCartUpdated();
    setBusyId(null);
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="h-9 w-36 bg-line/50 rounded animate-pulse mb-8" />
        <div className="grid md:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="py-6 flex gap-4 animate-pulse border-b border-line/40">
                <div className="w-24 h-28 bg-line/50 rounded-md shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-line/50 rounded w-1/2" />
                  <div className="h-4 bg-line/50 rounded w-1/4" />
                  <div className="h-8 bg-line/50 rounded-full w-32 mt-4" />
                </div>
              </div>
            ))}
          </div>
          <div className="border border-line/60 rounded-md p-6 h-64 animate-pulse space-y-4">
            <div className="h-5 bg-line/50 rounded w-1/3" />
            <div className="h-4 bg-line/50 rounded w-full" />
            <div className="h-4 bg-line/50 rounded w-full" />
            <div className="h-10 bg-line/50 rounded-full w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="display-heading text-3xl mb-3">Your Bag Needs a Login</h1>
        <p className="text-ink-soft mb-8">{error}</p>
        <Link
          href="/login"
          className="inline-block bg-signal text-paper px-6 py-3 rounded-full font-medium hover:bg-signal-dark transition-colors"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }
  if (data.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="display-heading text-3xl mb-3">Your Bag Is Empty</h1>
        <p className="text-ink-soft mb-8">Nothing here yet — find something you like.</p>
        <Link
          href="/products"
          className="inline-block bg-ink text-paper px-6 py-3 rounded-full font-medium hover:bg-ink/90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <h1 className="display-heading text-3xl mb-8">Your Bag</h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <ul className="divide-y divide-line">
          {data.items.map((item) => (
            <li key={item.id} className="py-6 flex gap-4">
              <Link href={`/products/${item.slug}`} className="shrink-0">
                <ProductImage
                  colorHex={item.color_hex}
                  subcategory={FALLBACK_SUBCATEGORY}
                  imageUrl={item.image_url}
                  alt={item.name}
                  className="w-24 h-28 rounded-md"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-medium hover:text-signal">
                      {item.name}
                    </Link>
                    <p className="text-sm text-ink-soft">{item.color_name}</p>
                  </div>
                  <span className="font-semibold whitespace-nowrap">
                    {item.price * item.quantity} MAD
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {/* Editable size — no need to leave the cart */}
                  <label className="flex items-center gap-2 text-sm">
                    Size
                    <select
                      value={item.size}
                      disabled={busyId === item.id}
                      onChange={(e) => updateSize(item.id, e.target.value)}
                      className="border border-line rounded-md px-2 py-1 bg-paper"
                    >
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  {item.quantity >= 10 && (
                    <span className="text-xs text-ink-soft">Max 10 per item.</span>
                  )}

                  <div className="flex items-center border border-line rounded-full">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={busyId === item.id || item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={busyId === item.id || item.quantity >= 10}
                      className="w-8 h-8 flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={busyId === item.id}
                    className="text-sm text-ink-soft hover:text-signal underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="border border-line rounded-md p-6 h-fit">
          <h2 className="font-medium mb-4">Order Summary</h2>
          <div className="tick-rule mb-4" />
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span>{data.totals.subtotal} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span>{data.totals.shipping === 0 ? "Free" : `${data.totals.shipping} MAD`}</span>
            </div>
          </div>
          <div className="tick-rule mb-4" />
          <div className="flex justify-between font-semibold text-lg mb-6">
            <span>Total</span>
            <span>{data.totals.total} MAD</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center bg-signal text-paper py-3.5 rounded-full font-medium hover:bg-signal-dark transition-colors"
          >
            Checkout
          </Link>
          {data.totals.subtotal < 500 && (
            <p className="text-xs text-ink-soft mt-3 text-center">
              Add {500 - data.totals.subtotal} MAD more for free shipping
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "24", "26", "28", "30", "32", "34", "2Y", "4Y", "6Y", "8Y"];
