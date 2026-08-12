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
};

export function registerUser(email: string, passwordRaw: string, fullName: string): User {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const hash = bcrypt.hashSync(passwordRaw, 10);
  
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, oauth_provider) 
    VALUES (?, ?, ?, NULL)
  `).run(email, hash, fullName);
  
  return {
    id: result.lastInsertRowid as number,
    email,
    full_name: fullName,
    created_at: new Date().toISOString(),
    oauth_provider: null,
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
  };
}

export function findUserByEmail(email: string): User | null {
  const user = db.prepare("SELECT id, email, full_name, created_at, oauth_provider FROM users WHERE email = ?").get(email) as any;
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    created_at: user.created_at,
    oauth_provider: user.oauth_provider ?? null,
  };
}

export function createOAuthUser(email: string, fullName: string): User {
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, oauth_provider)
    VALUES (?, ?, ?, ?)
  `).run(email, bcrypt.hashSync(randomUUID(), 10), fullName, "google");

  return {
    id: result.lastInsertRowid as number,
    email,
    full_name: fullName,
    created_at: new Date().toISOString(),
    oauth_provider: "google",
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
  
  const user = db.prepare("SELECT id, email, full_name, created_at, oauth_provider FROM users WHERE id = ?").get(userId) as User | undefined;
  return user || null;
}
