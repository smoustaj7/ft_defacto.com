import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_NAME = "defacto_session";
const AUTH_COOKIE_NAME = "defacto_auth";

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME);
  if (existing?.value) return existing.value;

  const id = randomUUID();
  cookieStore.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}

export async function getAuthUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(AUTH_COOKIE_NAME);
  if (existing?.value) return parseInt(existing.value, 10);
  return null;
}

export async function setAuthSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, userId.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
