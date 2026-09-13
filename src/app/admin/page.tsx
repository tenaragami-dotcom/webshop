import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, pendingBookings, unpaidOrders] = await Promise.all([
    prisma.product.count(),
    prisma.rentalBooking.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { paymentStatus: "UNPAID" } }),
  ]);

  const stats = [
    { label: "商品数", value: productCount },
    { label: "未確認のレンタル予約", value: pendingBookings },
    { label: "未払いの注文", value: unpaidOrders },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl">ダッシュボード</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-line p-4 text-center">
            <p className="text-2xl">{s.value}</p>
            <p className="mt-1 text-[11px] text-charcoal-soft">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
