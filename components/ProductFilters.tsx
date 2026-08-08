"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  const category = params.get("category") ?? "";
  const subcategory = params.get("subcategory") ?? "";
  const sort = params.get("sort") ?? "newest";
  const sale = params.get("sale") === "1";
  const q = params.get("q") ?? "";

  const activeFilterCount = [category, subcategory, sale ? "sale" : "", q].filter(Boolean).length;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "category") next.delete("subcategory");
    startTransition(() => {
      router.push(`/products?${next.toString()}`, { scroll: false });
    });
  }

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-soft mb-3 font-semibold">
          Department
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => updateParam("category", c.value || null)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === c.value
                  ? "bg-ink text-paper border-ink"
                  : "border-line bg-paper text-ink hover:border-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {subcategories.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-soft mb-3 font-semibold">
            Category
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateParam("subcategory", null)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                !subcategory ? "bg-ink text-paper border-ink" : "border-line bg-paper text-ink hover:border-ink"
              }`}
            >
              All
            </button>
            {subcategories.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateParam("subcategory", s)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                  subcategory === s ? "bg-ink text-paper border-ink" : "border-line bg-paper text-ink hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs uppercase tracking-wider text-ink-soft mb-3 font-semibold">
          Sort by
        </div>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full h-11 border border-line rounded-md px-3 text-sm bg-paper text-ink focus:outline-2 focus:outline-signal"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-3 text-sm font-medium cursor-pointer select-none py-1">
          <input
            type="checkbox"
            checked={sale}
            onChange={(e) => updateParam("sale", e.target.checked ? "1" : null)}
            className="w-4 h-4 accent-[var(--color-signal)] rounded"
          />
          <span>Sale only</span>
        </label>
      </div>

      {(category || subcategory || sale || q) && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              router.push("/products");
              setIsOpen(false);
            }}
            className="text-sm text-signal font-medium underline hover:text-signal-dark"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 border border-ink bg-paper text-ink rounded-full text-sm font-medium hover:bg-bone transition-colors"
        >
          <FilterIcon />
          <span>Filters & Sort</span>
          {activeFilterCount > 0 && (
            <span className="bg-signal text-paper text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Slide-over Drawer / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div className="relative bg-paper rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">Filters & Sort</span>
                {activeFilterCount > 0 && (
                  <span className="bg-signal text-paper text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-bone text-lg"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <FilterContent />
            </div>

            <div className="p-4 border-t border-line bg-paper">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full min-h-[48px] bg-ink text-paper rounded-full font-medium hover:bg-ink/90 transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:block">
        <FilterContent />
      </div>
    </>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8" cy="6" r="2" fill="var(--color-paper)" />
      <circle cx="16" cy="12" r="2" fill="var(--color-paper)" />
      <circle cx="12" cy="18" r="2" fill="var(--color-paper)" />
    </svg>
  );
}
