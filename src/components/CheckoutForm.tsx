"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useIsClient } from "@/lib/use-is-client";
import { formatDate, formatPrice } from "@/lib/format";

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [shippingName, setShippingName] = useState(defaultName);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CREDIT_CARD" | "BANK_TRANSFER">(
    "CREDIT_CARD"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName,
          shippingAddress,
          shippingPhone,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            type: i.type,
            quantity: i.quantity,
            rentalStart: i.rentalStart,
            rentalEnd: i.rentalEnd,
            variantName: i.variantName,
            planType: i.planType,
            extensionDays: i.extensionDays,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "注文処理に失敗しました。");
        return;
      }
      clear();
      router.push(data.redirectUrl);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isClient) return null;

  if (items.length === 0) {
    return <p className="mt-8 text-sm text-charcoal-soft">カートが空です。</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      <div>
        <h2 className="text-xs tracking-wide-jp text-gold">ご注文内容</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.type}-${item.rentalStart ?? ""}-${item.variantName ?? ""}`}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p>
                  {item.name}
                  {item.type === "RENTAL" ? "（レンタル）" : `（購入 ×${item.quantity}）`}
                </p>
                {item.variantName && (
                  <p className="text-[11px] text-charcoal-soft">カラー: {item.variantName}</p>
                )}
                {item.rentalStart && item.rentalEnd && (
                  <p className="text-[11px] text-charcoal-soft">
                    {formatDate(item.rentalStart)} 〜 {formatDate(item.rentalEnd)}
                    {item.planType && item.planType !== "STANDARD" && item.planLabel && (
                      <>　({item.planLabel})</>
                    )}
                    {!!item.extensionDays && ` / ${item.extensionDays}日延長`}
                  </p>
                )}
              </div>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between text-base">
          <span>合計</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs tracking-wide-jp text-gold">お届け先情報</h2>
        <label className="block text-xs">
          お名前
          <input
            required
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs">
          ご住所
          <input
            required
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
            placeholder="都道府県市区町村番地"
          />
        </label>
        <label className="block text-xs">
          電話番号
          <input
            required
            value={shippingPhone}
            onChange={(e) => setShippingPhone(e.target.value)}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs tracking-wide-jp text-gold">お支払い方法</h2>
        <label className="flex cursor-pointer items-center gap-2 border border-line px-3 py-2 text-xs">
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "CREDIT_CARD"}
            onChange={() => setPaymentMethod("CREDIT_CARD")}
          />
          クレジットカード払い
        </label>
        <label className="flex cursor-pointer items-center gap-2 border border-line px-3 py-2 text-xs">
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "BANK_TRANSFER"}
            onChange={() => setPaymentMethod("BANK_TRANSFER")}
          />
          銀行振込
        </label>
        {paymentMethod === "BANK_TRANSFER" && (
          <p className="text-[11px] text-charcoal-soft">
            ご注文確定後、お振込み先をメールにてご案内いたします。ご入金確認後にあらためてご連絡いたします。
          </p>
        )}
      </div>

      <p className="text-[11px] text-charcoal-soft">
        ※本デモ環境では実際の決済は行われません。クレジットカード払いをお選びの場合、Stripeテストキー未設定のため
        ご注文完了と同時にお支払い済みとして処理されます。
      </p>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-charcoal bg-charcoal py-3 text-xs tracking-wide-jp text-white hover:bg-charcoal/90 disabled:opacity-50"
      >
        {submitting ? "処理中..." : "注文を確定する"}
      </button>
    </form>
  );
}
