"use client";

import { useState } from "react";

type VariantEntry = {
  key: string;
  name: string;
  colorHex: string;
  stockQuantity: number;
};

export function ProductVariantsField({
  initialVariants,
}: {
  initialVariants: { name: string; colorHex: string | null; stockQuantity: number }[];
}) {
  const [variants, setVariants] = useState<VariantEntry[]>(
    initialVariants.map((v, i) => ({
      key: `existing-${i}`,
      name: v.name,
      colorHex: v.colorHex ?? "#d4af37",
      stockQuantity: v.stockQuantity,
    }))
  );

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { key: crypto.randomUUID(), name: "", colorHex: "#d4af37", stockQuantity: 1 },
    ]);
  }

  function removeVariant(key: string) {
    setVariants((prev) => prev.filter((v) => v.key !== key));
  }

  function updateVariant(
    key: string,
    field: "name" | "colorHex" | "stockQuantity",
    value: string
  ) {
    setVariants((prev) =>
      prev.map((v) =>
        v.key === key
          ? {
              ...v,
              [field]: field === "stockQuantity" ? Math.max(0, Number(value)) : value,
            }
          : v
      )
    );
  }

  return (
    <div>
      <p className="text-xs">カラーバリエーション（任意）</p>
      <p className="mt-1 text-[11px] text-charcoal-soft">
        1つ以上登録すると、購入者がカートに入れる際に色を選択できるようになります。登録した場合、下の「在庫数」ではなく色ごとの在庫数が使用されます。
      </p>

      <div className="mt-2 space-y-2">
        {variants.map((v) => (
          <div key={v.key} className="flex items-center gap-2">
            <input
              type="color"
              name="variantColorHex"
              value={v.colorHex}
              onChange={(e) => updateVariant(v.key, "colorHex", e.target.value)}
              className="h-8 w-8 flex-shrink-0 border border-line"
            />
            <input
              type="text"
              name="variantName"
              placeholder="色名（例：ゴールド）"
              value={v.name}
              onChange={(e) => updateVariant(v.key, "name", e.target.value)}
              className="flex-1 border border-line px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              name="variantStock"
              min={0}
              placeholder="在庫数"
              value={v.stockQuantity}
              onChange={(e) => updateVariant(v.key, "stockQuantity", e.target.value)}
              className="w-20 flex-shrink-0 border border-line px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => removeVariant(v.key)}
              className="flex-shrink-0 text-xs text-red-600 hover:underline"
            >
              削除
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addVariant}
        className="mt-2 border border-line px-3 py-1.5 text-xs hover:border-gold"
      >
        ＋ バリエーションを追加
      </button>
    </div>
  );
}
