"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyCartUpdated } from "@/lib/useCartCount";

export function AddToCartPanel({
  productId,
  sizes,
}: {
  productId: number;
  sizes: string[];
}) {
  const router = useRouter();
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "added" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!size) {
      setError("Please select a size first");
      return;
    }
    setError(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, quantity }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error();
      notifyCartUpdated();
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-soft mb-2.5 flex items-center justify-between font-medium">
          <span>Size {size ? `— ${size}` : ""}</span>
          <button type="button" className="underline hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-signal rounded-xs">
            Size guide
          </button>
        </div>
        <div className="tick-rule mb-3.5" />
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s);
                setError(null);
              }}
              className={`min-w-11 h-11 px-3.5 rounded-md border text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2 ${
                size === s
                  ? "bg-ink text-paper border-ink shadow-xs"
                  : "border-line bg-paper text-ink hover:border-ink hover:bg-bone/40"
              }`}
              aria-pressed={size === s}
            >
              {s}
            </button>
          ))}
        </div>
        {error && <p className="text-xs font-medium text-signal mt-2 animate-shake">{error}</p>}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-sm text-ink-soft font-medium">Quantity</span>
        <div className="flex items-center border border-line rounded-full bg-paper">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-base hover:bg-bone rounded-l-full transition-colors focus-visible:outline-2 focus-visible:outline-signal"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold text-ink">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="w-9 h-9 flex items-center justify-center text-base hover:bg-bone rounded-r-full transition-colors focus-visible:outline-2 focus-visible:outline-signal"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={status === "loading"}
          className="w-full bg-signal text-paper py-3.5 rounded-full font-medium hover:bg-signal-dark active:scale-[0.99] transition-all disabled:opacity-60 shadow-xs focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2"
        >
          {status === "loading" ? "Adding…" : status === "added" ? "Added ✓" : "Add to Bag"}
        </button>

        {status === "added" && (
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="w-full border border-ink text-ink py-3 rounded-full font-medium hover:bg-bone transition-colors focus-visible:outline-2 focus-visible:outline-signal"
          >
            View Bag
          </button>
        )}
      </div>
    </div>
  );
}
