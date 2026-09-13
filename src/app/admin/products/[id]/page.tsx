import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/app/admin/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
      },
    }),
    prisma.brand.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany(),
  ]);

  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="font-display text-2xl">商品編集</h1>
      <ProductForm
        brands={brands}
        categories={categories}
        product={product}
        images={product.images}
        variants={product.variants}
        action={action}
      />
    </div>
  );
}
