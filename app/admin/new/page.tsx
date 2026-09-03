"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
  name: "",
  category: "men",
  subcategory: "t-shirts",
  price: "89",
  compare_at_price: "",
  description: "",
  color_name: "Off White",
  color_hex: "#F2EFE9",
  image_url: "",
  sizes: "XS,S,M,L,XL",
  is_new: true,
  is_bestseller: false,
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      ...form,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      sizes: form.sizes.split(",").map((size) => size.trim()).filter(Boolean),
      is_new: !!form.is_new,
      is_bestseller: !!form.is_bestseller,
    };

    const res = await fetch("app/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Unable to create product");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Admin</p>
        <h1 className="display-heading text-3xl mt-2">Add new product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 border border-line rounded-xl p-5 md:p-6 bg-paper">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Product name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Subcategory</span>
            <input
              required
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Color name</span>
            <input
              required
              value={form.color_name}
              onChange={(e) => setForm({ ...form, color_name: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Price (MAD)</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Compare-at price (optional)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.compare_at_price}
              onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
            />
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium">Description</span>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Color hex</span>
            <input
              required
              type="color"
              value={form.color_hex}
              onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
              className="w-full h-[44px] border border-line rounded-md px-2 py-1 bg-paper"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Image URL (optional)</span>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
              placeholder="/products/example.svg"
            />
          </label>

          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium">Available sizes</span>
            <input
              required
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2.5"
              placeholder="XS,S,M,L,XL"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
            />
            Mark as new
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_bestseller}
              onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
            />
            Mark as bestseller
          </label>
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.push("/admin")} className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-bone transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
