import { db } from "./db";

export type CartLine = {
  id: number;
  product_id: number;
  size: string;
  quantity: number;
  slug: string;
  name: string;
  price: number;
  color_name: string;
  color_hex: string;
};

export function getCart(sessionId: string): CartLine[] {
  return db
    .prepare(
      `SELECT ci.id, ci.product_id, ci.size, ci.quantity,
              p.slug, p.name, p.price, p.color_name, p.color_hex
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.session_id = ?
       ORDER BY ci.created_at DESC`
    )
    .all(sessionId) as CartLine[];
}

export function addToCart(
  sessionId: string,
  productId: number,
  size: string,
  quantity: number
) {
  const existing = db
    .prepare(
      "SELECT id, quantity FROM cart_items WHERE session_id = ? AND product_id = ? AND size = ?"
    )
    .get(sessionId, productId, size) as { id: number; quantity: number } | undefined;

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(
      existing.quantity + quantity,
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO cart_items (session_id, product_id, size, quantity) VALUES (?, ?, ?, ?)"
    ).run(sessionId, productId, size, quantity);
  }
}

export function updateCartItem(
  sessionId: string,
  itemId: number,
  updates: { quantity?: number; size?: string }
) {
  const item = db
    .prepare("SELECT * FROM cart_items WHERE id = ? AND session_id = ?")
    .get(itemId, sessionId);
  if (!item) return;

  if (updates.quantity !== undefined) {
    if (updates.quantity <= 0) {
      db.prepare("DELETE FROM cart_items WHERE id = ?").run(itemId);
      return;
    }
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(
      updates.quantity,
      itemId
    );
  }
  if (updates.size !== undefined) {
    db.prepare("UPDATE cart_items SET size = ? WHERE id = ?").run(
      updates.size,
      itemId
    );
  }
}

export function removeCartItem(sessionId: string, itemId: number) {
  db.prepare("DELETE FROM cart_items WHERE id = ? AND session_id = ?").run(
    itemId,
    sessionId
  );
}

export function clearCart(sessionId: string) {
  db.prepare("DELETE FROM cart_items WHERE session_id = ?").run(sessionId);
}

export function cartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 500 ? 0 : 39;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}
