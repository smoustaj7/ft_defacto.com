import { db } from "./db";
import bcrypt from "bcryptjs";
import { getAuthUserId } from "./session";

export type User = {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
};

export function registerUser(email: string, passwordRaw: string, fullName: string): User {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const hash = bcrypt.hashSync(passwordRaw, 10);
  
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name) 
    VALUES (?, ?, ?)
  `).run(email, hash, fullName);
  
  return {
    id: result.lastInsertRowid as number,
    email,
    full_name: fullName,
    created_at: new Date().toISOString()
  };
}

export function loginUser(email: string, passwordRaw: string): User {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const match = bcrypt.compareSync(passwordRaw, user.password_hash);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    created_at: user.created_at
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;
  
  const user = db.prepare("SELECT id, email, full_name, created_at FROM users WHERE id = ?").get(userId) as User | undefined;
  return user || null;
}
