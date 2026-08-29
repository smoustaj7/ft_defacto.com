import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdminUser } from "@/lib/auth";
import { createProduct, deleteProduct } from "@/lib/products";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    requireAdminUser(user);

    const contentType = req.headers.get("content-type") || "";
    let payload: any = null;

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const formData = await req.formData();
      const methodOverride = String(formData.get("_method") || "");
      if (methodOverride.toLowerCase() === "delete") {
        const productId = Number(formData.get("productId") || 0);
        if (!productId) {
          return NextResponse.json({ error: "productId is required" }, { status: 400 });
        }

        const removed = deleteProduct(productId);
        if (!removed) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.redirect(new URL("/admin", req.url));
      }

      payload = Object.fromEntries(formData.entries());
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const product = createProduct({
      name: String(payload.name ?? ""),
      category: String(payload.category ?? ""),
      subcategory: String(payload.subcategory ?? ""),
      price: Number(payload.price ?? 0),
      compare_at_price: payload.compare_at_price == null ? null : Number(payload.compare_at_price),
      description: String(payload.description ?? ""),
      color_name: String(payload.color_name ?? ""),
      color_hex: String(payload.color_hex ?? "#EAE2D7"),
      image_url: typeof payload.image_url === "string" ? payload.image_url : "",
      sizes: Array.isArray(payload.sizes)
        ? payload.sizes
        : typeof payload.sizes === "string"
          ? payload.sizes.split(",").map((size: string) => size.trim()).filter(Boolean)
          : ["S", "M", "L"],
      is_new: Boolean(payload.is_new),
      is_bestseller: Boolean(payload.is_bestseller),
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Admin product creation failed" }, { status: error?.message === "Admin access required" ? 403 : 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    requireAdminUser(user);

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const removed = deleteProduct(Number(productId));
    if (!removed) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Admin product deletion failed" }, { status: error?.message === "Admin access required" ? 403 : 400 });
  }
}
