"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CartLine = {
  id: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
  color_name: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartLine[] | null>(null);
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, total: 0 });
  const [form, setForm] = useState({ fullName: "", address: "", city: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setTotals(data.totals);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      router.push(`/checkout/confirmation?order=${data.orderId}`);
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  if (items === null) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ink-soft">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="display-heading text-3xl mb-3">Your Bag Is Empty</h1>
        <Link href="/products" className="text-signal font-medium underline">
          Go find something to buy
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <h1 className="display-heading text-3xl mb-2">Checkout</h1>
      <p className="text-sm text-ink-soft mb-8">
        One page, one step. No account required.
      </p>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
              placeholder="Souhaib El Amrani"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="address">
              Shipping address
            </label>
            <input
              id="address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
              placeholder="Street, building, apartment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="city">
              City
            </label>
            <input
              id="city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
              placeholder="Casablanca"
            />
          </div>

          {error && <p className="text-sm text-signal">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-signal text-paper py-3.5 rounded-full font-medium hover:bg-signal-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place Order — ${totals.total} MAD`}
          </button>
          <p className="text-xs text-ink-soft text-center">
            This is a demo checkout. No payment is collected.
          </p>
        </form>

        <aside className="border border-line rounded-md p-6 h-fit">
          <h2 className="font-medium mb-4">Order Summary</h2>
          <div className="tick-rule mb-4" />
          <ul className="space-y-3 mb-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-ink-soft">
                  {item.name} ({item.size}) × {item.quantity}
                </span>
                <span>{item.price * item.quantity} MAD</span>
              </li>
            ))}
          </ul>
          <div className="tick-rule mb-4" />
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span>{totals.subtotal} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span>{totals.shipping === 0 ? "Free" : `${totals.shipping} MAD`}</span>
            </div>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{totals.total} MAD</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
