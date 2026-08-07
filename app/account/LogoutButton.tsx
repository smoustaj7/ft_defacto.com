"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifyAuthChanged } from "@/lib/useAuthStatus";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    notifyAuthChanged();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm font-medium underline hover:text-signal transition-colors"
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
