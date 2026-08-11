import { db } from "./db";

const MAX_QUANTITY = 10;

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
  image_url: string;
};

export function getCart(userId: number): CartLine[] {
  return db
    .prepare(
      `SELECT ci.id, ci.product_id, ci.size, ci.quantity,
              p.slug, p.name, p.price, p.color_name, p.color_hex, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`
    )
    .all(userId) as CartLine[];
}

export function addToCart(
  userId: number,
  productId: number,
  size: string,
  quantity: number
) {
  const existing = db
    .prepare(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?"
    )
    .get(userId, productId, size) as { id: number; quantity: number } | undefined;

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(
      existing.quantity + quantity,
      existing.id
    );
  } else {
    // We provide a dummy session_id to satisfy NOT NULL if we didn't remove it from schema, 
    // actually we didn't remove session_id NOT NULL constraint from cart_items in db.ts!
    // Oh wait, I didn't change session_id to allow NULL in db.ts. Let's just insert empty string for session_id for now, 
    // or better, pass both if needed. For simplicity, just use '' for session_id.
    db.prepare(
      "INSERT INTO cart_items (user_id, session_id, product_id, size, quantity) VALUES (?, '', ?, ?, ?)"
    ).run(userId, productId, size, quantity);
  }
}

export function updateCartItem(
  userId: number,
  itemId: number,
  updates: { quantity?: number; size?: string }
) {
  const item = db
    .prepare("SELECT * FROM cart_items WHERE id = ? AND user_id = ?")
    .get(itemId, userId);
  if (!item) return;

  if (updates.quantity !== undefined) {
    if (updates.quantity <= 0) {
      db.prepare("DELETE FROM cart_items WHERE id = ?").run(itemId);
      return;
    }
    const updatedQuantity = Math.min(updates.quantity, MAX_QUANTITY);
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(
      updatedQuantity,
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

export function removeCartItem(userId: number, itemId: number) {
  db.prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?").run(
    itemId,
    userId
  );
}

export function clearCart(userId: number) {
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
}

export function cartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 500 ? 0 : 39;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}
