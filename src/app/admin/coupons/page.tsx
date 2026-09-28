import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { isCouponUsable } from "@/lib/coupon";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    include: { user: true },
    orderBy: { issuedAt: "desc" },
  });

  const activeCount = coupons.filter((c) => isCouponUsable(c)).length;
  const usedCount = coupons.filter((c) => c.usedAt).length;

  return (
    <div>
      <h1 className="font-display text-2xl">クーポン管理</h1>
      <p className="mt-2 text-xs text-charcoal-soft">
        ご試着プランのご注文が支払い完了になると、標準プラン専用の10%OFFクーポン（発行から6ヶ月間有効）が自動的に発行されます。
      </p>
      <p className="mt-2 text-xs text-charcoal-soft">
        発行数 {coupons.length}件 ／ 利用可能 {activeCount}件 ／ 使用済み {usedCount}件
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left text-charcoal-soft">
              <th className="py-2 pr-4">発行日</th>
              <th className="py-2 pr-4">コード</th>
              <th className="py-2 pr-4">会員</th>
              <th className="py-2 pr-4">割引率</th>
              <th className="py-2 pr-4">有効期限</th>
              <th className="py-2 pr-4">ステータス</th>
              <th className="py-2 pr-4">発行元注文</th>
              <th className="py-2 pr-4">使用済み注文</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const usable = isCouponUsable(coupon);
              return (
                <tr key={coupon.id} className="border-b border-line/60">
                  <td className="py-2 pr-4">{formatDate(coupon.issuedAt)}</td>
                  <td className="py-2 pr-4 font-mono">{coupon.code}</td>
                  <td className="py-2 pr-4">
                    {coupon.user.name}（{coupon.user.email}）
                  </td>
                  <td className="py-2 pr-4">{coupon.discountPercent}%</td>
                  <td className="py-2 pr-4">{formatDate(coupon.expiresAt)}</td>
                  <td className="py-2 pr-4">
                    {coupon.usedAt ? (
                      <span className="text-charcoal-soft">使用済み</span>
                    ) : usable ? (
                      <span className="text-gold">利用可能</span>
                    ) : (
                      <span className="text-red-600">期限切れ</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[11px] text-charcoal-soft">
                    #{coupon.sourceOrderId.slice(-8)}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[11px] text-charcoal-soft">
                    {coupon.usedOrderId ? `#${coupon.usedOrderId.slice(-8)}` : "-"}
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-charcoal-soft">
                  発行済みのクーポンはまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
