"use client";

import { useEffect, useState } from "react";

export function useAuthStatus() {
  const [status, setStatus] = useState({ loggedIn: false, isAdmin: false });

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setStatus({
        loggedIn: !!data.loggedIn,
        isAdmin: !!data.user?.is_admin,
      });
    } catch {
      setStatus({ loggedIn: false, isAdmin: false });
    }
  };

  useEffect(() => {
    refresh();
    window.addEventListener("auth:changed", refresh);
    return () => window.removeEventListener("auth:changed", refresh);
  }, []);

  return status;
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth:changed"));
}
