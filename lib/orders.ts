import { db } from "./db";

export type Order = {
  id: number;
  session_id: string;
  user_id: number | null;
  items: string; // JSON
  subtotal: number;
  shipping: number;
  total: number;
  full_name: string;
  address: string;
  city: string;
  email: string;
  status: string;
  created_at: string;
};

export function getOrderById(id: number): Order | undefined {
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
}

export function getOrdersByUserId(userId: number): Order[] {
  return db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Order[];
}
