import type { Brand, Category, Product, ProductImage, ProductVariant } from "@prisma/client";
import { ProductImagesField } from "@/components/admin/ProductImagesField";
import { ProductVariantsField } from "@/components/admin/ProductVariantsField";

type Props = {
  brands: Brand[];
  categories: Category[];
  product?: Product;
  images?: ProductImage[];
  variants?: ProductVariant[];
  action: (formData: FormData) => Promise<void>;
};

export function ProductForm({
  brands,
  categories,
  product,
  images,
  variants,
  action,
}: Props) {
  return (
    <form action={action} className="mt-6 max-w-xl space-y-4">
      <label className="block text-xs">
        商品名
        <input
          required
          name="name"
          defaultValue={product?.name}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      <ProductImagesField
        initialImages={(images ?? []).map((img) => ({ seed: img.seed, url: img.url }))}
      />

      <label className="block text-xs">
        説明文
        <textarea
          required
          name="description"
          defaultValue={product?.description}
          rows={4}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      <ProductVariantsField
        initialVariants={(variants ?? []).map((v) => ({
          name: v.name,
          colorHex: v.colorHex,
          stockQuantity: v.stockQuantity,
        }))}
      />

      <div className="flex gap-4">
        <label className="block flex-1 text-xs">
          ブランド
          <select
            required
            name="brandId"
            defaultValue={product?.brandId}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block flex-1 text-xs">
          カテゴリー
          <select
            required
            name="categoryId"
            defaultValue={product?.categoryId}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-4">
        <label className="block flex-1 text-xs">
          販売価格（空欄で販売不可）
          <input
            type="number"
            name="priceSell"
            defaultValue={product?.priceSell ?? ""}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="block flex-1 text-xs">
          レンタル価格（空欄でレンタル不可）
          <input
            type="number"
            name="priceRental"
            defaultValue={product?.priceRental ?? ""}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="border border-line p-4">
        <p className="text-xs tracking-wide-jp text-gold">レンタル設定</p>

        <div className="mt-3 flex gap-4">
          <label className="block flex-1 text-xs">
            基本プラン日数
            <input
              type="number"
              min={1}
              name="rentalBaseDays"
              defaultValue={product?.rentalBaseDays ?? 4}
              className="mt-1 w-full border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block flex-1 text-xs">
            延長1日あたりの料金（空欄で延長不可）
            <input
              type="number"
              min={0}
              name="rentalExtensionPricePerDay"
              defaultValue={product?.rentalExtensionPricePerDay ?? ""}
              className="mt-1 w-full border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block flex-1 text-xs">
            延長可能日数の上限
            <input
              type="number"
              min={0}
              name="rentalMaxExtensionDays"
              defaultValue={product?.rentalMaxExtensionDays ?? 14}
              className="mt-1 w-full border border-line px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-3 flex gap-4">
          <label className="block flex-1 text-xs">
            ご試着プラン料金（空欄で非表示）
            <input
              type="number"
              min={0}
              name="tryOnPlanPrice"
              defaultValue={product?.tryOnPlanPrice ?? ""}
              className="mt-1 w-full border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block flex-1 text-xs">
            ご試着プランの日数
            <input
              type="number"
              min={1}
              name="tryOnPlanDays"
              defaultValue={product?.tryOnPlanDays ?? 4}
              className="mt-1 w-full border border-line px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="block flex-1 text-xs">
          在庫数（カラーバリエーションがない場合のみ使用）
          <input
            type="number"
            min={0}
            name="stockQuantity"
            defaultValue={product?.stockQuantity ?? 1}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="block flex-1 text-xs">
          状態
          <select
            name="status"
            defaultValue={product?.status ?? "ACTIVE"}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          >
            <option value="ACTIVE">販売中</option>
            <option value="SOLD_OUT">売り切れ</option>
            <option value="DRAFT">非公開</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="border border-charcoal bg-charcoal px-6 py-2.5 text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
      >
        保存する
      </button>
    </form>
  );
}
