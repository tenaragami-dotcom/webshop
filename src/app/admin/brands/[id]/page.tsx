import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandForm } from "@/components/admin/BrandForm";
import { updateBrand } from "@/app/admin/actions";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  const action = updateBrand.bind(null, brand.id);

  return (
    <div>
      <h1 className="font-display text-2xl">ブランド編集</h1>
      <BrandForm brand={brand} action={action} />
    </div>
  );
}
