"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { notifyAuthChanged } from "@/lib/useAuthStatus";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-20 text-sm text-ink-soft">Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function triggerGoogleSignIn() {
    window.location.href = "/api/auth/google";
  }

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

    notifyAuthChanged();
    router.push("/account");
    router.refresh();
  }

  useEffect(() => {
    const googleError = searchParams?.get("error");
    if (googleError) {
      setError(decodeURIComponent(googleError));
    }
  }, [searchParams]);

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
        <button
          type="button"
          onClick={triggerGoogleSignIn}
          className="w-full border border-line text-ink py-3 rounded-full font-medium hover:bg-bone transition-colors mt-3"
        >
          Continue with Google
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
