import type { Brand } from "@prisma/client";

type Props = {
  brand?: Brand;
  action: (formData: FormData) => Promise<void>;
};

export function BrandForm({ brand, action }: Props) {
  return (
    <form action={action} className="mt-6 max-w-xl space-y-4">
      <label className="block text-xs">
        ブランド名
        <input
          required
          name="name"
          defaultValue={brand?.name}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs">
        読み方（カタカナ、任意）
        <input
          name="reading"
          defaultValue={brand?.reading ?? ""}
          placeholder="例：リュミエール・ブラン"
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs">
        紹介文
        <textarea
          required
          name="description"
          defaultValue={brand?.description}
          rows={4}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs">
        表示順（小さい数字ほど先に表示）
        <input
          type="number"
          name="sortOrder"
          defaultValue={brand?.sortOrder ?? 0}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          name="excludeFromCatalog"
          defaultChecked={brand?.excludeFromCatalog ?? false}
          className="h-4 w-4"
        />
        ALL ITEM／RELATED ITEMSに表示しない
      </label>

      <button
        type="submit"
        className="border border-charcoal bg-charcoal px-6 py-2.5 text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
      >
        保存する
      </button>
    </form>
  );
}
