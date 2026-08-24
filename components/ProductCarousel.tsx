"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/db";
import { ProductCard } from "./ProductCard";

export function ProductCarousel({
  id,
  products,
}: {
  id: string;
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(products.length > 0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateControls = () => {
      setCanGoBack(track.scrollLeft > 1);
      setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
    };

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [products.length]);

  function move(direction: number) {
    trackRef.current?.scrollBy({
      left: direction * (trackRef.current.clientWidth * 0.9),
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        id={id}
        className="flex gap-3 sm:gap-4 overflow-hidden scroll-smooth"
        aria-live="polite"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="basis-[calc((100%-0.75rem)/2)] md:basis-[calc((100%-2.25rem)/4)] shrink-0"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!canGoBack}
          aria-label="Show previous products"
          title="Previous products"
          className="size-10 border border-ink rounded-full text-lg leading-none transition-colors hover:bg-ink hover:text-paper disabled:opacity-25 disabled:pointer-events-none"
        >
          <span aria-hidden>←</span>
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!canGoForward}
          aria-label="Show more products"
          title="More products"
          className="size-10 border border-ink rounded-full text-lg leading-none transition-colors hover:bg-ink hover:text-paper disabled:opacity-25 disabled:pointer-events-none"
        >
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}