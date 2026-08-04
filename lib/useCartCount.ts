"use client";

import { useEffect, useState } from "react";

export function useCartCount() {
  const [count, setCount] = useState<number | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      const total = (data.items ?? []).reduce(
        (sum: number, i: { quantity: number }) => sum + i.quantity,
        0
      );
      setCount(total);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    refresh();
    window.addEventListener("cart:updated", refresh);
    return () => window.removeEventListener("cart:updated", refresh);
  }, []);

  return count;
}

export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart:updated"));
}
