"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useIsClient } from "@/lib/use-is-client";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { formatDate, formatPrice } from "@/lib/format";

export default function CartPage() {
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!isClient) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl tracking-wide-jp">CART</h1>

      {items.length === 0 ? (
        <div className="mt-16 text-center text-sm text-charcoal-soft">
          <p>カートに商品がありません。</p>
          <Link href="/products" className="mt-4 inline-block text-gold hover:underline">
            商品一覧を見る
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.type}-${item.rentalStart ?? ""}-${item.variantName ?? ""}`}
                className="flex gap-4 py-6"
              >
                <PlaceholderImage
                  seed={item.imageSeed}
                  url={item.imageUrl}
                  width={120}
                  height={150}
                  className="h-28 w-24 flex-shrink-0 bg-blush object-cover"
                />
                <div className="flex-1">
                  <p className="text-[10px] tracking-wide-jp text-gold">
                    {item.type === "PURCHASE" ? "SELL" : "RENTAL"}
                  </p>
                  <Link href={`/products/${item.slug}`} className="text-sm hover:text-gold">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="mt-1 text-[11px] text-charcoal-soft">
                      カラー: {item.variantName}
                    </p>
                  )}
                  {item.type === "RENTAL" && item.rentalStart && item.rentalEnd && (
                    <p className="mt-1 text-[11px] text-charcoal-soft">
                      {formatDate(item.rentalStart)} 〜 {formatDate(item.rentalEnd)}
                      {item.planType && item.planType !== "STANDARD" && item.planLabel && (
                        <>　({item.planLabel})</>
                      )}
                      {!!item.extensionDays && ` / ${item.extensionDays}日延長`}
                    </p>
                  )}
                  <p className="mt-1 text-sm">{formatPrice(item.price)}</p>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    {item.type === "PURCHASE" ? (
                      <label className="flex items-center gap-2 text-charcoal-soft">
                        数量
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              {
                                productId: item.productId,
                                type: item.type,
                                rentalStart: item.rentalStart,
                                variantName: item.variantName,
                              },
                              Number(e.target.value)
                            )
                          }
                          className="w-14 border border-line px-2 py-1"
                        />
                      </label>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        removeItem({
                          productId: item.productId,
                          type: item.type,
                          rentalStart: item.rentalStart,
                          variantName: item.variantName,
                        })
                      }
                      className="text-charcoal-soft underline hover:text-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-sm tracking-wide-jp">合計</span>
            <span className="text-xl">{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-8 block w-full border border-charcoal bg-charcoal py-3 text-center text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
          >
            レジに進む
          </Link>
        </>
      )}
    </div>
  );
}
