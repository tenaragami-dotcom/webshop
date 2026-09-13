import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { updateBookingStatus } from "@/app/admin/actions";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "確認中",
  CONFIRMED: "確定",
  SHIPPED: "発送済み",
  RETURNED: "返却済み",
  CANCELLED: "キャンセル",
};

export default async function AdminBookingsPage() {
  const bookings = await prisma.rentalBooking.findMany({
    include: { product: true, user: true },
    orderBy: { startDate: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">レンタル予約管理</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left text-charcoal-soft">
              <th className="py-2 pr-4">商品</th>
              <th className="py-2 pr-4">カラー</th>
              <th className="py-2 pr-4">利用者</th>
              <th className="py-2 pr-4">期間</th>
              <th className="py-2 pr-4">ステータス</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const action = updateBookingStatus.bind(null, b.id);
              return (
                <tr key={b.id} className="border-b border-line/60">
                  <td className="py-2 pr-4">{b.product.name}</td>
                  <td className="py-2 pr-4">{b.variantName ?? "-"}</td>
                  <td className="py-2 pr-4">{b.user.name}</td>
                  <td className="py-2 pr-4">
                    {formatDate(b.startDate)} 〜 {formatDate(b.endDate)}
                  </td>
                  <td className="py-2 pr-4">{STATUS_LABEL[b.status]}</td>
                  <td className="py-2 pr-4">
                    <form action={action} className="flex items-center gap-2">
                      <select
                        name="status"
                        defaultValue={b.status}
                        className="border border-line px-2 py-1"
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="border border-charcoal px-2 py-1 hover:bg-charcoal hover:text-white"
                      >
                        更新
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="mt-4 text-sm text-charcoal-soft">レンタル予約はまだありません。</p>
        )}
      </div>
    </div>
  );
}
