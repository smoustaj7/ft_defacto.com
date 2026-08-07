"use client";

import { useEffect, useState } from "react";

export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setLoggedIn(data.loggedIn);
    } catch {
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    refresh();
    window.addEventListener("auth:changed", refresh);
    return () => window.removeEventListener("auth:changed", refresh);
  }, []);

  return loggedIn;
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth:changed"));
}
