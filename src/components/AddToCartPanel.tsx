"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatDate, formatPrice } from "@/lib/format";
import { RentalCalendar } from "@/components/RentalCalendar";
import {
  addDaysStr,
  availablePlanTypes,
  computeRentalEnd,
  computeRentalPrice,
  planLabel,
  planBaseDays,
  todayStr,
  type RentalPlanType,
} from "@/lib/rental-plan";

type BookedRange = { startDate: string; endDate: string };
type Variant = { name: string; colorHex: string | null; stockQuantity: number };

type Props = {
  productId: string;
  slug: string;
  name: string;
  imageSeed: string;
  imageUrl?: string;
  isSellable: boolean;
  isRentable: boolean;
  priceSell: number | null;
  priceRental: number | null;
  stockQuantity: number;
  bookedRanges: BookedRange[];
  variants: Variant[];
  rentalBaseDays: number;
  rentalExtensionPricePerDay: number | null;
  rentalMaxExtensionDays: number;
  tryOnPlanPrice: number | null;
  tryOnPlanDays: number;
};

export function AddToCartPanel({
  productId,
  slug,
  name,
  imageSeed,
  imageUrl,
  isSellable,
  isRentable,
  priceSell,
  priceRental,
  stockQuantity,
  bookedRanges,
  variants,
  rentalBaseDays,
  rentalExtensionPricePerDay,
  rentalMaxExtensionDays,
  tryOnPlanPrice,
  tryOnPlanDays,
}: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const today = todayStr();
  const currentlyRented =
    isRentable &&
    bookedRanges.some(
      (r) => r.startDate.slice(0, 10) <= today && today <= r.endDate.slice(0, 10)
    );

  const rentalProduct = {
    priceRental,
    rentalBaseDays,
    rentalExtensionPricePerDay,
    rentalMaxExtensionDays,
    tryOnPlanPrice,
    tryOnPlanDays,
  };
  const plans = availablePlanTypes(rentalProduct);

  const [mode, setMode] = useState<"PURCHASE" | "RENTAL">(
    isSellable && stockQuantity > 0 ? "PURCHASE" : "RENTAL"
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.name);
  const [planType, setPlanType] = useState<RentalPlanType>(plans[0] ?? "STANDARD");
  const [extensionDays, setExtensionDays] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);

  const effectiveStock =
    variants.length > 0
      ? (variants.find((v) => v.name === selectedVariant)?.stockQuantity ?? 0)
      : stockQuantity;
  const soldOut = isSellable && effectiveStock <= 0;
  const canPurchase = isSellable && !soldOut;
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const occupiedDays = planBaseDays(planType, rentalProduct) + (planType !== "TRY_ON" ? extensionDays : 0);
  const endDate = startDate ? computeRentalEnd(startDate, planType, extensionDays, rentalProduct) : null;
  const deliveryDate = startDate ? addDaysStr(startDate, -2) : null;
  const rentalPrice = computeRentalPrice(planType, extensionDays, rentalProduct);

  function handlePlanChange(next: RentalPlanType) {
    setPlanType(next);
    setExtensionDays(0);
    setStartDate(null);
    setError(null);
  }

  async function handleAdd() {
    setError(null);
    setAdded(false);

    if (variants.length > 0 && !selectedVariant) {
      setError("カラーを選択してください。");
      return;
    }

    if (mode === "PURCHASE") {
      if (priceSell === null || !canPurchase) return;
      addItem({
        productId,
        slug,
        name,
        imageSeed,
        imageUrl,
        variantName: selectedVariant,
        type: "PURCHASE",
        price: priceSell,
        quantity,
      });
      setAdded(true);
      return;
    }

    if (rentalPrice === null || !startDate || !endDate) {
      setError("ご利用日を選択してください。");
      return;
    }

    setChecking(true);
    try {
      const params = new URLSearchParams({
        productId,
        start: startDate,
        end: endDate,
      });
      const res = await fetch(`/api/availability?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "空き状況の確認に失敗しました。");
        return;
      }
      if (!data.available) {
        setError("選択した日程は既にご予約が入っています。別の日程をお選びください。");
        return;
      }
      addItem({
        productId,
        slug,
        name,
        imageSeed,
        imageUrl,
        variantName: selectedVariant,
        type: "RENTAL",
        price: rentalPrice,
        quantity: 1,
        rentalStart: startDate,
        rentalEnd: endDate,
        planType,
        planLabel: planLabel(planType, rentalProduct),
        extensionDays: planType === "TRY_ON" ? 0 : extensionDays,
      });
      setAdded(true);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5 text-[10px] tracking-wide-jp">
        {soldOut && (
          <span className="bg-charcoal px-2 py-1 text-white">SOLD OUT</span>
        )}
        {currentlyRented && (
          <span className="border border-blush-dark px-2 py-1 text-blush-dark">
            レンタル中
          </span>
        )}
      </div>

      {variants.length > 0 && (
        <div>
          <p className="text-xs tracking-wide-jp text-charcoal-soft">
            カラー{selectedVariant ? `：${selectedVariant}` : "を選択してください"}
            {selectedVariant && effectiveStock <= 0 && "（品切れ）"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => {
                  setSelectedVariant(v.name);
                  setQuantity(1);
                }}
                title={`${v.name}${v.stockQuantity <= 0 ? "（品切れ）" : ""}`}
                aria-label={v.name}
                className={`relative h-8 w-8 rounded-full border-2 ${
                  selectedVariant === v.name ? "border-charcoal" : "border-line"
                } ${v.stockQuantity <= 0 ? "opacity-30" : ""}`}
                style={{ backgroundColor: v.colorHex ?? "#cccccc" }}
              />
            ))}
          </div>
        </div>
      )}

      {isSellable && isRentable && (
        <div className="flex gap-2 text-xs tracking-wide-jp">
          <button
            type="button"
            onClick={() => canPurchase && setMode("PURCHASE")}
            disabled={!canPurchase}
            className={`flex-1 border py-2 disabled:cursor-not-allowed disabled:opacity-40 ${
              mode === "PURCHASE" ? "border-charcoal bg-charcoal text-white" : "border-line"
            }`}
          >
            SELL / 購入{soldOut ? "（品切れ）" : ""}
          </button>
          <button
            type="button"
            onClick={() => setMode("RENTAL")}
            className={`flex-1 border py-2 ${
              mode === "RENTAL" ? "border-charcoal bg-charcoal text-white" : "border-line"
            }`}
          >
            RENTAL / レンタル
          </button>
        </div>
      )}

      {mode === "PURCHASE" &&
        priceSell !== null &&
        (canPurchase ? (
          <div>
            <p className="text-lg">{formatPrice(priceSell)}</p>
            <label className="mt-3 flex items-center gap-2 text-xs text-charcoal-soft">
              数量
              <input
                type="number"
                min={1}
                max={Math.max(1, Math.min(5, effectiveStock))}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(Math.max(1, Number(e.target.value)), effectiveStock)
                  )
                }
                className="w-16 border border-line px-2 py-1"
              />
              <span>（在庫 {effectiveStock} 点）</span>
            </label>
          </div>
        ) : (
          <p className="text-sm text-charcoal-soft">
            申し訳ございません、この商品は現在品切れです。
          </p>
        ))}

      {mode === "RENTAL" && plans.length > 0 && (
        <div className="space-y-4">
          {plans.length > 1 && (
            <div>
              <p className="text-xs tracking-wide-jp text-charcoal-soft">ご利用プラン</p>
              <div className="mt-2 space-y-1.5">
                {plans.map((p) => (
                  <label
                    key={p}
                    className={`flex cursor-pointer items-center justify-between border px-3 py-2 text-xs ${
                      planType === p ? "border-charcoal bg-blush/40" : "border-line"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="planType"
                        checked={planType === p}
                        onChange={() => handlePlanChange(p)}
                      />
                      {planLabel(p, rentalProduct)}
                    </span>
                    <span className="text-charcoal-soft">
                      {p === "STANDARD" && priceRental !== null && formatPrice(priceRental)}
                      {p === "TRY_ON" && tryOnPlanPrice !== null && formatPrice(tryOnPlanPrice)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <p className="text-lg text-blush-dark">
            {rentalPrice !== null ? `レンタル料金 ${formatPrice(rentalPrice)}` : "この商品はレンタルできません"}
          </p>

          <RentalCalendar
            bookedRanges={bookedRanges}
            selected={startDate}
            onSelect={setStartDate}
            occupiedDays={occupiedDays}
            label="ご利用日（初日）を選択してください"
          />

          {planType !== "TRY_ON" && rentalExtensionPricePerDay !== null && (
            <label className="block text-xs">
              延長日数
              <select
                value={extensionDays}
                onChange={(e) => setExtensionDays(Number(e.target.value))}
                className="mt-1 w-full border border-line px-2 py-1.5"
              >
                {Array.from({ length: rentalMaxExtensionDays + 1 }, (_, i) => i).map((d) => (
                  <option key={d} value={d}>
                    {d === 0
                      ? "延長しない"
                      : `${d}日延長（+${formatPrice(d * rentalExtensionPricePerDay)}）`}
                  </option>
                ))}
              </select>
            </label>
          )}

          {startDate && endDate && (
            <div className="border border-line bg-blush/40 p-3 text-[11px] text-charcoal-soft">
              <p className="flex justify-between">
                <span>お届け予定日</span>
                <span>{deliveryDate && formatDate(deliveryDate)}</span>
              </p>
              <p className="flex justify-between">
                <span>ご利用日</span>
                <span>{formatDate(startDate)}</span>
              </p>
              <p className="flex justify-between">
                <span>返却日</span>
                <span>{formatDate(endDate)}</span>
              </p>
            </div>
          )}

          {bookedRanges.length > 0 && (
            <div className="border border-line bg-blush/40 p-3 text-[11px] text-charcoal-soft">
              <p className="mb-1 text-gold">ご予約済みの日程</p>
              <ul className="space-y-0.5">
                {bookedRanges.map((r, i) => (
                  <li key={i}>
                    {formatDate(r.startDate)} 〜 {formatDate(r.endDate)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      {added && (
        <p className="text-xs text-gold">
          カートに追加しました。
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="ml-2 underline"
          >
            カートを見る
          </button>
        </p>
      )}

      {((mode === "RENTAL" && plans.length > 0) || canPurchase) && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={checking}
          className="w-full border border-charcoal bg-charcoal py-3 text-xs tracking-wide-jp text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {checking ? "確認中..." : "カートに入れる"}
        </button>
      )}
    </div>
  );
}
