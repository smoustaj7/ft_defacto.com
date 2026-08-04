"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartCount } from "@/lib/useCartCount";

const CATEGORIES = [
  { label: "Men", href: "/products?category=men" },
  { label: "Women", href: "/products?category=women" },
  { label: "Kids", href: "/products?category=kids" },
  { label: "New In", href: "/products?sort=newest" },
  { label: "Sale", href: "/products?sale=1" },
];

export function Navbar() {
  const count = useCartCount();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="display-heading text-2xl tracking-tight shrink-0">
            Defacto
          </Link>

          {/* Categories: always visible, never behind a hamburger */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Categories">
            {CATEGORIES.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className={`text-sm font-medium tracking-wide hover:text-signal transition-colors ${
                  c.label === "Sale" ? "text-signal" : "text-ink"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <form
              action="/products"
              className="hidden sm:flex items-center border border-line rounded-full px-3 py-1.5"
            >
              <input
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="text-sm outline-none w-32 lg:w-48 bg-transparent"
                aria-label="Search products"
              />
            </form>
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-bone transition-colors"
              aria-label="View cart"
            >
              <BagIcon />
              {count !== null && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-signal text-white text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile category row — still fully visible, just scrollable, never hidden */}
        <nav
          className="md:hidden flex items-center gap-5 overflow-x-auto pb-3 -mt-1"
          aria-label="Categories"
        >
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`text-sm font-medium whitespace-nowrap ${
                c.label === "Sale" ? "text-signal" : "text-ink"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l1 13H5L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}
