import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { addToCart, getCart, updateCartItem, removeCartItem, cartTotals } from "@/lib/cart";

export async function GET() {
  const sessionId = await getOrCreateSessionId();
  const items = getCart(sessionId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}

export async function POST(req: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const { productId, size, quantity } = await req.json();

  if (!productId || !size) {
    return NextResponse.json(
      { error: "productId and size are required" },
      { status: 400 }
    );
  }

  addToCart(sessionId, productId, size, quantity ?? 1);
  const items = getCart(sessionId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}

export async function PATCH(req: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const { itemId, quantity, size } = await req.json();

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  updateCartItem(sessionId, itemId, { quantity, size });
  const items = getCart(sessionId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}

export async function DELETE(req: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const { itemId } = await req.json();

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  removeCartItem(sessionId, itemId);
  const items = getCart(sessionId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}
