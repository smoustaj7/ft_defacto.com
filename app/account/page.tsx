import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUserId, Order } from "@/lib/orders";
import LogoutButton from "./LogoutButton";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const orders = getOrdersByUserId(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="display-heading text-3xl mb-1">My Account</h1>
          <p className="text-sm text-ink-soft">
            Welcome back, {user.full_name} ({user.email})
          </p>
        </div>
        <LogoutButton />
      </div>

      <section>
        <h2 className="text-lg font-medium mb-4">Orders & Returns</h2>
        <div className="tick-rule mb-6" />

        {orders.length === 0 ? (
          <div className="py-12 text-center border border-line rounded-md bg-bone/20">
            <p className="text-ink-soft">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const items: any[] = JSON.parse(order.items);
  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="border border-line rounded-md p-5 sm:p-6">
      <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
        <div>
          <div className="text-sm text-ink-soft mb-1">Order placed</div>
          <div className="font-medium">{date}</div>
        </div>
        <div>
          <div className="text-sm text-ink-soft mb-1">Total</div>
          <div className="font-medium">{order.total} MAD</div>
        </div>
        <div>
          <div className="text-sm text-ink-soft mb-1">Order #</div>
          <div className="font-medium">{order.id}</div>
        </div>
        <div className="text-right flex-1 sm:flex-none min-w-[100px]">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-bone capitalize">
            {order.status}
          </span>
        </div>
      </div>

      <div className="tick-rule mb-4" />

      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-4 text-sm">
            <div className="w-16 h-20 bg-bone rounded shrink-0"></div>
            <div className="flex-1">
              <div className="font-medium mb-1">{item.name}</div>
              <div className="text-ink-soft">
                Size: {item.size} <br />
                Qty: {item.quantity}
              </div>
            </div>
            <div className="font-medium">{item.price * item.quantity} MAD</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
