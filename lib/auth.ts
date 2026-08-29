import { db } from "./db";
import bcrypt from "bcryptjs";
import { getAuthUserId } from "./session";
import { randomUUID } from "crypto";

export type User = {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  oauth_provider?: string | null;
  is_admin: boolean;
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@defacto.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

export function ensureDefaultAdminUser() {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(ADMIN_EMAIL) as { id?: number } | undefined;
  if (existing) {
    db.prepare("UPDATE users SET is_admin = 1 WHERE email = ?").run(ADMIN_EMAIL);
    return;
  }

  db.prepare(`
    INSERT INTO users (email, password_hash, full_name, oauth_provider, is_admin)
    VALUES (?, ?, ?, NULL, 1)
  `).run(ADMIN_EMAIL, bcrypt.hashSync(ADMIN_PASSWORD, 10), "Defacto Admin");
}

export function registerUser(email: string, passwordRaw: string, fullName: string): User {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const hash = bcrypt.hashSync(passwordRaw, 10);

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, oauth_provider, is_admin)
    VALUES (?, ?, ?, NULL, 0)
  `).run(email, hash, fullName);

  return {
    id: result.lastInsertRowid as number,
    email,
    full_name: fullName,
    created_at: new Date().toISOString(),
    oauth_provider: null,
    is_admin: false,
  };
}

export function loginUser(email: string, passwordRaw: string): User {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.oauth_provider) {
    throw new Error(`Please sign in with ${user.oauth_provider}`);
  }

  const match = bcrypt.compareSync(passwordRaw, user.password_hash);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    created_at: user.created_at,
    oauth_provider: user.oauth_provider ?? null,
    is_admin: Boolean(user.is_admin),
  };
}

export function findUserByEmail(email: string): User | null {
  const user = db.prepare("SELECT id, email, full_name, created_at, oauth_provider, is_admin FROM users WHERE email = ?").get(email) as any;
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    created_at: user.created_at,
    oauth_provider: user.oauth_provider ?? null,
    is_admin: Boolean(user.is_admin),
  };
}

export function createOAuthUser(email: string, fullName: string): User {
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, oauth_provider, is_admin)
    VALUES (?, ?, ?, ?, 0)
  `).run(email, bcrypt.hashSync(randomUUID(), 10), fullName, "google");

  return {
    id: result.lastInsertRowid as number,
    email,
    full_name: fullName,
    created_at: new Date().toISOString(),
    oauth_provider: "google",
    is_admin: false,
  };
}

export function findOrCreateOAuthUser(email: string, fullName: string): User {
  const existing = findUserByEmail(email);
  if (existing) {
    if (existing.oauth_provider && existing.oauth_provider !== "google") {
      throw new Error("An account exists with this email using a different sign-in method.");
    }
    return existing;
  }
  return createOAuthUser(email, fullName);
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const user = db.prepare("SELECT id, email, full_name, created_at, oauth_provider, is_admin FROM users WHERE id = ?").get(userId) as User | undefined;
  return user || null;
}

export function requireAdminUser(user: User | null): User {
  if (!user || !user.is_admin) {
    throw new Error("Admin access required");
  }
  return user;
}

ensureDefaultAdminUser();
