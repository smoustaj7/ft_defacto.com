"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notifyAuthChanged } from "@/lib/useAuthStatus";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    notifyAuthChanged();
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="display-heading text-3xl mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="password">
            Password (6+ characters)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper py-3 rounded-full font-medium hover:bg-ink/90 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="text-signal hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
