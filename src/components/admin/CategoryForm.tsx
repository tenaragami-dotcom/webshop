import type { Category } from "@prisma/client";

type Props = {
  category?: Category;
  action: (formData: FormData) => Promise<void>;
};

export function CategoryForm({ category, action }: Props) {
  return (
    <form action={action} className="mt-6 max-w-xl space-y-4">
      <label className="block text-xs">
        カテゴリー名
        <input
          required
          name="name"
          defaultValue={category?.name}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
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
