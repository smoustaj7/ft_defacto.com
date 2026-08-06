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
      setError("Pick a size first");
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
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-soft mb-3 flex items-center justify-between">
        <span>Size {size ? `— ${size}` : ""}</span>
        <button className="underline hover:text-ink">Size guide</button>
      </div>
      <div className="tick-rule mb-4" />
      <div className="flex flex-wrap gap-2 mb-2">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSize(s);
              setError(null);
            }}
            className={`min-w-11 h-11 px-3 rounded-md border text-sm font-medium transition-colors ${
              size === s
                ? "bg-ink text-paper border-ink"
                : "border-line hover:border-ink"
            }`}
            aria-pressed={size === s}
          >
            {s}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-signal mb-2">{error}</p>}

      <div className="flex items-center gap-4 mt-6 mb-6">
        <span className="text-sm text-ink-soft">Quantity</span>
        <div className="flex items-center border border-line rounded-full">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="w-9 h-9 flex items-center justify-center text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={status === "loading"}
        className="w-full bg-signal text-paper py-3.5 rounded-full font-medium hover:bg-signal-dark transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Adding…" : status === "added" ? "Added ✓" : "Add to Bag"}
      </button>

      {status === "added" && (
        <button
          onClick={() => router.push("/cart")}
          className="w-full mt-3 border border-ink text-ink py-3 rounded-full font-medium hover:bg-bone transition-colors"
        >
          View Bag
        </button>
      )}
    </div>
  );
}
