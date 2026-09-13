import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const session = await auth();
  if (!orderId || !session?.user) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, rentalBookings: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-xs tracking-wide-jp text-gold">ORDER COMPLETE</p>
      <h1 className="font-display mt-3 text-2xl">ご注文ありがとうございました</h1>
      <p className="mt-2 text-sm text-charcoal-soft">
        注文番号: {order.id} ／ ステータス:{" "}
        {order.paymentStatus === "PAID" ? "支払い済み" : "未払い"}
      </p>

      {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus !== "PAID" && (
        <p className="mx-auto mt-4 max-w-md border border-line bg-blush/40 p-4 text-left text-xs leading-relaxed text-charcoal-soft">
          お振込み先のご案内をメールにてお送りしました。ご入金確認後、担当者よりあらためてご連絡いたします。
        </p>
      )}

      <ul className="mt-10 divide-y divide-line border-y border-line text-left text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3">
            <div>
              <p>{item.product.name}</p>
              <p className="text-[11px] text-charcoal-soft">
                {item.type === "PURCHASE" ? `購入 ×${item.quantity}` : "レンタル"}
                {item.variantName ? ` ／ カラー: ${item.variantName}` : ""}
              </p>
            </div>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      {order.rentalBookings.length > 0 && (
        <div className="mt-6 text-left text-xs text-charcoal-soft">
          <p className="text-gold">レンタルご利用期間</p>
          <ul className="mt-2 space-y-1">
            {order.rentalBookings.map((b) => (
              <li key={b.id}>
                {formatDate(b.startDate)} 〜 {formatDate(b.endDate)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex justify-between text-base">
        <span>合計金額</span>
        <span>{formatPrice(order.totalAmount)}</span>
      </div>

      <div className="mt-10 flex justify-center gap-4 text-xs tracking-wide-jp">
        <Link href="/account" className="border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-white">
          マイページへ
        </Link>
        <Link href="/products" className="border border-line px-6 py-3 hover:border-gold">
          お買い物を続ける
        </Link>
      </div>
    </div>
  );
}
