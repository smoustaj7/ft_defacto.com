"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
];

const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Bestsellers", value: "bestseller" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export function ProductFilters({
  subcategories,
}: {
  subcategories: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const category = params.get("category") ?? "";
  const subcategory = params.get("subcategory") ?? "";
  const sort = params.get("sort") ?? "newest";
  const sale = params.get("sale") === "1";
  const q = params.get("q") ?? "";

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // changing department resets the subcategory filter
    if (key === "category") next.delete("subcategory");
    startTransition(() => {
      router.push(`/products?${next.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="space-y-8">
      {/* Sort — top and obvious, not buried */}
      <div className="flex items-center justify-between md:hidden">
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-ink-soft mb-3">
          Department
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => updateParam("category", c.value || null)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                category === c.value
                  ? "bg-ink text-paper border-ink"
                  : "border-line hover:border-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {subcategories.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-soft mb-3">
            Category
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParam("subcategory", null)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                !subcategory ? "bg-ink text-paper border-ink" : "border-line hover:border-ink"
              }`}
            >
              All
            </button>
            {subcategories.map((s) => (
              <button
                key={s}
                onClick={() => updateParam("subcategory", s)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                  subcategory === s ? "bg-ink text-paper border-ink" : "border-line hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs uppercase tracking-wider text-ink-soft mb-3">
          Sort by
        </div>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 text-sm bg-paper"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={sale}
          onChange={(e) => updateParam("sale", e.target.checked ? "1" : null)}
          className="accent-[var(--color-signal)]"
        />
        Sale only
      </label>

      {(category || subcategory || sale || q) && (
        <button
          onClick={() => router.push("/products")}
          className="text-sm text-signal font-medium hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
