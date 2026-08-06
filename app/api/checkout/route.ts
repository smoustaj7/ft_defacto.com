import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getCart, clearCart, cartTotals } from "@/lib/cart";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a dummy sessionId to insert, since we still need it for the schema
  // Alternatively, just provide empty string, as cart logic changed
  const sessionId = "checkout-dummy";

  const { fullName, address, city, email } = await req.json();

  if (!fullName || !address || !city || !email) {
    return NextResponse.json(
      { error: "All shipping fields are required" },
      { status: 400 }
    );
  }

  const items = getCart(userId);
  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const { subtotal, shipping, total } = cartTotals(items);

  const result = db
    .prepare(
      `INSERT INTO orders (session_id, user_id, items, subtotal, shipping, total, full_name, address, city, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      sessionId,
      userId,
      JSON.stringify(items),
      subtotal,
      shipping,
      total,
      fullName,
      address,
      city,
      email
    );

  clearCart(userId);

  return NextResponse.json({ orderId: result.lastInsertRowid });
}
