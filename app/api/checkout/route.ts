import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { getCart, clearCart, cartTotals } from "@/lib/cart";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const { fullName, address, city, email } = await req.json();

  if (!fullName || !address || !city || !email) {
    return NextResponse.json(
      { error: "All shipping fields are required" },
      { status: 400 }
    );
  }

  const items = getCart(sessionId);
  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const { subtotal, shipping, total } = cartTotals(items);

  const result = db
    .prepare(
      `INSERT INTO orders (session_id, items, subtotal, shipping, total, full_name, address, city, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      sessionId,
      JSON.stringify(items),
      subtotal,
      shipping,
      total,
      fullName,
      address,
      city,
      email
    );

  clearCart(sessionId);

  return NextResponse.json({ orderId: result.lastInsertRowid });
}
