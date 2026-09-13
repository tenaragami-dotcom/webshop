import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { AddToCartPanel } from "@/components/AddToCartPanel";
import { ProductCard } from "@/components/ProductCard";
import { BrandName } from "@/components/BrandName";
import { getBookedRanges } from "@/lib/availability";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
  });

  if (!product) notFound();

  const [bookedRanges, related] = await Promise.all([
    product.isRentable ? getBookedRanges(product.id) : Promise.resolve([]),
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "ACTIVE",
        brand: { excludeFromCatalog: false },
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
      },
      take: 4,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-8 text-[11px] text-charcoal-soft">
        <Link href="/products" className="hover:text-gold">
          ALL ITEM
        </Link>{" "}
        / {product.category.name}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          {product.images.map((img) => (
            <PlaceholderImage
              key={img.id}
              seed={img.seed}
              url={img.url}
              label={product.brand.name}
              width={600}
              height={750}
              className="aspect-[4/5] w-full bg-blush object-cover"
            />
          ))}
        </div>

        <div>
          <p className="text-xs tracking-wide-jp text-gold">
            <Link href={`/brands/${product.brand.slug}`} className="hover:underline">
              <BrandName name={product.brand.name} reading={product.brand.reading} />
            </Link>
          </p>
          <h1 className="font-display mt-2 text-2xl">{product.name}</h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-charcoal-soft">
            {product.description}
          </p>

          <div className="mt-8 border-t border-line pt-8">
            <AddToCartPanel
              productId={product.id}
              slug={product.slug}
              name={product.name}
              imageSeed={product.images[0]?.seed ?? product.slug}
              imageUrl={product.images[0]?.url ?? undefined}
              isSellable={product.isSellable}
              isRentable={product.isRentable}
              priceSell={product.priceSell}
              priceRental={product.priceRental}
              stockQuantity={product.stockQuantity}
              bookedRanges={bookedRanges.map((b) => ({
                startDate: b.startDate.toISOString(),
                endDate: b.endDate.toISOString(),
              }))}
              variants={product.variants.map((v) => ({
                name: v.name,
                colorHex: v.colorHex,
                stockQuantity: v.stockQuantity,
              }))}
              rentalBaseDays={product.rentalBaseDays}
              rentalExtensionPricePerDay={product.rentalExtensionPricePerDay}
              rentalMaxExtensionDays={product.rentalMaxExtensionDays}
              tryOnPlanPrice={product.tryOnPlanPrice}
              tryOnPlanDays={product.tryOnPlanDays}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display mb-6 text-xl tracking-wide-jp">RELATED ITEMS</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
