import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";

export default async function ConfirmationPage({
  searchParams,
}: PageProps<"/checkout/confirmation">) {
  const sp = await searchParams;
  const orderId = Number(sp.order);
  if (!orderId) notFound();

  const order = getOrderById(orderId);
  if (!order) notFound();

  const items: { name: string; size: string; quantity: number; price: number }[] =
    JSON.parse(order.items);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-moss text-paper flex items-center justify-center mx-auto mb-6 text-2xl">
        ✓
      </div>
      <h1 className="display-heading text-3xl mb-2">Order Confirmed</h1>
      <p className="text-ink-soft mb-8">
        Thanks, {order.full_name.split(" ")[0]}. Order #{order.id} is on its way to{" "}
        {order.address}, {order.city}.
      </p>

      <div className="border border-line rounded-md p-6 text-left mb-8">
        <div className="tick-rule mb-4" />
        <ul className="space-y-3 mb-4">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-ink-soft">
                {item.name} ({item.size}) × {item.quantity}
              </span>
              <span>{item.price * item.quantity} MAD</span>
            </li>
          ))}
        </ul>
        <div className="tick-rule mb-4" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total paid</span>
          <span>{order.total} MAD</span>
        </div>
      </div>

      <Link
        href="/products"
        className="inline-block bg-ink text-paper px-6 py-3 rounded-full font-medium hover:bg-ink/90"
      >
        Keep shopping
      </Link>
    </div>
  );
}
