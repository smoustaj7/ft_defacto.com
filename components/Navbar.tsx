"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCartCount } from "@/lib/useCartCount";
import { useAuthStatus } from "@/lib/useAuthStatus";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { label: "Men", href: "/products?category=men" },
  { label: "Women", href: "/products?category=women" },
  { label: "Kids", href: "/products?category=kids" },
  { label: "New In", href: "/products?sort=newest" },
  { label: "Sale", href: "/products?sale=1" },
];

export function Navbar() {
  const count = useCartCount();
  const { loggedIn, isAdmin } = useAuthStatus();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ products: any[]; categories: any[] } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-line">
      <div className="border-b border-line/70 bg-bone/35">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-8 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          <span>Defacto / Everyday essentials</span>
          <span className="hidden sm:block">Designed for the daily rotation</span>
          <Link href="/products?sale=1" className="text-signal font-semibold hover:text-signal-dark transition-colors">
            Sale now live
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-[4.5rem] gap-4">
          <Link href="/" className="group flex items-center gap-3 shrink-0" aria-label="Defacto home">
            <span className="relative flex items-center justify-center w-10 h-10 bg-signal text-paper overflow-hidden">
              <span className="display-heading text-lg leading-none">D</span>
              <span className="absolute right-0 top-0 w-2 h-2 bg-ink" aria-hidden="true" />
            </span>
            <span>
              <span className="display-heading block text-[1.65rem] leading-none tracking-tight group-hover:text-signal transition-colors">
                Defacto
              </span>
              <span className="hidden sm:block mt-1 text-[9px] uppercase tracking-[0.24em] text-ink-soft">
                Daily uniform
              </span>
            </span>
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

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Input Container */}
            <div className="relative" ref={dropdownRef}>
              <form
                action="/products"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) {
                    setShowDropdown(false);
                    router.push(`/products?q=${encodeURIComponent(query)}`);
                  }
                }}
                className="flex items-center border border-line rounded-full px-3 py-2 bg-paper hover:border-ink-soft transition-colors"
              >
                <SearchIcon />
                <input
                  name="q"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (query.trim()) setShowDropdown(true);
                  }}
                  placeholder="Search the collection"
                  className="text-sm outline-none w-20 xs:w-28 sm:w-36 lg:w-44 bg-transparent ml-2 placeholder:text-ink-soft/70"
                  aria-label="Search products"
                  autoComplete="off"
                />
              </form>

              {showDropdown && results && (results.products.length > 0 || results.categories.length > 0) && (
                <div className="absolute top-full right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-paper border border-line rounded-md shadow-lg overflow-hidden z-50">
                  {results.categories.length > 0 && (
                    <div className="p-3 border-b border-line bg-bone/30">
                      <div className="text-xs uppercase tracking-wider text-ink-soft mb-2">Categories</div>
                      <div className="space-y-1">
                        {results.categories.map((c) => (
                          <Link
                            key={c.name}
                            href={`/products?subcategory=${c.name}`}
                            onClick={() => setShowDropdown(false)}
                            className="block text-sm hover:text-signal capitalize transition-colors"
                          >
                            {c.name} <span className="text-ink-soft text-xs ml-1">({c.count})</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.products.length > 0 && (
                    <div className="p-3">
                      <div className="text-xs uppercase tracking-wider text-ink-soft mb-2">Products</div>
                      <div className="space-y-3">
                        {results.products.slice(0, 4).map((p) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-start gap-3 group"
                          >
                            <div className="w-10 h-12 bg-line rounded overflow-hidden shrink-0">
                               <div className="w-full h-full bg-bone" />
                            </div>
                            <div>
                              <div className="text-sm font-medium group-hover:text-signal transition-colors line-clamp-1">{p.name}</div>
                              <div className="text-xs text-ink-soft">{p.price} MAD</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {results.products.length > 4 && (
                        <Link
                          href={`/products?q=${encodeURIComponent(query)}`}
                          onClick={() => setShowDropdown(false)}
                          className="block text-center text-xs font-medium text-signal hover:underline mt-4 mb-1"
                        >
                          View all matches
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-bone transition-colors"
              >
                Admin
              </Link>
            )}
            <Link
              href={loggedIn ? "/account" : "/login"}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-bone transition-colors"
              aria-label="Account"
            >
              <UserIcon />
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-bone transition-colors"
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

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" strokeLinejoin="round" />
    </svg>
  );
}
