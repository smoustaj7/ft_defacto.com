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
      <div className="flex justify-end gap-2 mb-4">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!canGoBack}
          aria-label="Show previous products"
          title="Previous products"
          className="group flex size-11 items-center justify-center rounded-sm border border-line bg-paper text-ink shadow-xs transition-all hover:border-ink hover:bg-bone focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span
            aria-hidden
            className="size-2.5 -translate-x-0.5 rotate-45 border-b-2 border-l-2 border-current transition-transform group-hover:-translate-x-1"
          />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!canGoForward}
          aria-label="Show more products"
          title="More products"
          className="group flex size-11 items-center justify-center rounded-sm border border-ink bg-ink text-paper shadow-xs transition-all hover:bg-signal hover:border-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span
            aria-hidden
            className="size-2.5 translate-x-0.5 rotate-45 border-t-2 border-r-2 border-current transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>

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
    </div>
  );
}