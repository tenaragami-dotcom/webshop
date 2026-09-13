import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { BrandName } from "@/components/BrandName";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) notFound();

  const products = await prisma.product.findMany({
    where: { brandId: brand.id, status: "ACTIVE" },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs tracking-wide-jp text-gold">BRAND</p>
      <h1 className="font-display mt-2 text-2xl tracking-wide-jp">
        <BrandName name={brand.name} reading={brand.reading} />
      </h1>
      <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-charcoal-soft">
        {brand.description}
      </p>

      {products.length > 0 && (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
