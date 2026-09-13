import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { updateOrderPaymentStatus } from "@/app/admin/actions";

const STATUS_LABEL: Record<string, string> = {
  UNPAID: "未払い",
  PAID: "支払い済み",
  FAILED: "失敗",
  REFUNDED: "返金済み",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CREDIT_CARD: "クレジットカード",
  BANK_TRANSFER: "銀行振込",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">注文管理</h1>

      <div className="mt-6 space-y-4">
        {orders.map((order) => {
          const action = updateOrderPaymentStatus.bind(null, order.id);
          return (
            <div key={order.id} className="border border-line p-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm">
                    {order.user.name}（{order.user.email}）
                  </p>
                  <p className="mt-1 text-charcoal-soft">
                    {formatDate(order.createdAt)} / {order.type} / {formatPrice(order.totalAmount)}
                    {" / "}
                    {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                  </p>
                  {order.cancelledAt && (
                    <p className="mt-1 text-red-600">
                      キャンセル済み（{formatDate(order.cancelledAt)} / キャンセル料{" "}
                      {order.cancellationFee !== null ? formatPrice(order.cancellationFee) : "-"}）
                    </p>
                  )}
                </div>
                <form action={action} className="flex items-center gap-2">
                  <select
                    name="paymentStatus"
                    defaultValue={order.paymentStatus}
                    className="border border-line px-2 py-1.5"
                  >
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="border border-charcoal px-3 py-1.5 hover:bg-charcoal hover:text-white"
                  >
                    更新
                  </button>
                </form>
              </div>
              <ul className="mt-2 space-y-1 text-charcoal-soft">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name}
                    {item.variantName ? `（${item.variantName}）` : ""} × {item.quantity}（
                    {item.type}）
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="text-sm text-charcoal-soft">注文はまだありません。</p>
        )}
      </div>
    </div>
  );
}
