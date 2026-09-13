import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/admin/actions";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl">新規商品登録</h1>
      <ProductForm brands={brands} categories={categories} action={createProduct} />
    </div>
  );
}
