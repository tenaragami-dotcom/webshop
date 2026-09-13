import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategory } from "@/app/admin/actions";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-display text-2xl">新規カテゴリー登録</h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
