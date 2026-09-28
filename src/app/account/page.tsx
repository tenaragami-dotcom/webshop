import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { SignOutButton } from "@/components/SignOutButton";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { canCancelOrder, computeCancellationFee } from "@/lib/cancellation";
import { isCouponUsable } from "@/lib/coupon";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/account/login?callbackUrl=/account");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } }, rentalBookings: true },
    orderBy: { createdAt: "desc" },
  });

  const coupons = await prisma.coupon.findMany({
    where: { userId: session.user.id },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-wide-jp text-gold">MY PAGE</p>
          <h1 className="font-display mt-2 text-2xl">{session.user.name} 様</h1>
          <p className="mt-1 text-xs text-charcoal-soft">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-lg tracking-wide-jp">ご注文履歴</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal-soft">ご注文履歴はありません。</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {orders.map((order) => {
              const cancellable = canCancelOrder(order);
              const fee = cancellable ? computeCancellationFee(order) : null;
              return (
                <li key={order.id} className="py-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-charcoal-soft">{formatDate(order.createdAt)}</span>
                    <span className="text-[11px] tracking-wide-jp text-gold">
                      {order.type === "RENTAL" ? "RENTAL" : "PURCHASE"} /{" "}
                      {order.cancelledAt
                        ? "キャンセル済み"
                        : order.paymentStatus === "PAID"
                          ? "支払い済み"
                          : "未払い"}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.product.name}
                        {item.variantName ? `（${item.variantName}）` : ""} × {item.quantity}
                        {item.giftWrap && " 🎁ギフトラッピング"}
                      </li>
                    ))}
                  </ul>
                  {order.discountAmount !== null && order.discountAmount > 0 && (
                    <p className="mt-1 text-right text-[11px] text-gold-dark">
                      クーポン割引 −{formatPrice(order.discountAmount)}
                    </p>
                  )}
                  <p className="mt-1 text-right">{formatPrice(order.totalAmount)}</p>
                  {order.cancelledAt && order.cancellationFee !== null && (
                    <p className="mt-1 text-right text-[11px] text-charcoal-soft">
                      キャンセル料 {formatPrice(order.cancellationFee)}
                      （{formatDate(order.cancelledAt)}）
                    </p>
                  )}
                  {cancellable && fee !== null && (
                    <div className="mt-2 text-right">
                      <CancelOrderButton orderId={order.id} fee={fee} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-lg tracking-wide-jp">クーポン</h2>
        {coupons.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal-soft">
            お持ちのクーポンはありません。ご試着プランをご利用いただくと、標準プラン専用の10%OFFクーポンが発行されます。
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {coupons.map((coupon) => {
              const usable = isCouponUsable(coupon);
              return (
                <li
                  key={coupon.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div>
                    <p className="font-mono text-sm tracking-wide">{coupon.code}</p>
                    <p className="mt-1 text-[11px] text-charcoal-soft">
                      標準プランのレンタルで{coupon.discountPercent}%OFF ／ 有効期限{" "}
                      {formatDate(coupon.expiresAt)}まで
                    </p>
                  </div>
                  <span
                    className={`text-[11px] tracking-wide-jp ${
                      usable ? "text-gold" : "text-charcoal-soft"
                    }`}
                  >
                    {coupon.usedAt ? "使用済み" : usable ? "利用可能" : "有効期限切れ"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-12 text-center">
        <Link href="/products" className="text-xs tracking-wide-jp text-gold hover:underline">
          商品一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
