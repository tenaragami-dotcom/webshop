import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { updateCategory } from "@/app/admin/actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  const action = updateCategory.bind(null, category.id);

  return (
    <div>
      <h1 className="font-display text-2xl">カテゴリー編集</h1>
      <CategoryForm category={category} action={action} />
    </div>
  );
}
