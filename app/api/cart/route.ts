import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { addToCart, getCart, updateCartItem, removeCartItem, cartTotals } from "@/lib/cart";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ items: [], totals: { subtotal: 0, shipping: 0, total: 0 } });
  
  const items = getCart(userId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, size, quantity } = await req.json();

  if (!productId || !size) {
    return NextResponse.json(
      { error: "productId and size are required" },
      { status: 400 }
    );
  }

  addToCart(userId, productId, size, quantity ?? 1);
  const items = getCart(userId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId, quantity, size } = await req.json();

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  updateCartItem(userId, itemId, { quantity, size });
  const items = getCart(userId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await req.json();

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  removeCartItem(userId, itemId);
  const items = getCart(userId);
  return NextResponse.json({ items, totals: cartTotals(items) });
}
