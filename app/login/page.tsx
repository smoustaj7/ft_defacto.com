"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh(); // Refresh to update navbar state
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="display-heading text-3xl mb-6 text-center">Log In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper py-3 rounded-full font-medium hover:bg-ink/90 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-ink-soft">
        Don't have an account?{" "}
        <Link href="/register" className="text-signal hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
