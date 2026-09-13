import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BrandName } from "@/components/BrandName";
import { BRAND_TINTS } from "@/lib/brand-tints";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs tracking-wide-jp text-gold">BRAND</p>
      <h1 className="font-display mt-2 text-2xl">取り扱いブランド</h1>

      <div className="mt-10 space-y-8">
        {brands.map((brand) => {
          const tint = BRAND_TINTS[brand.name];
          const accentColor = tint?.text ? (tint.sub ?? tint.text) : tint?.bg;
          return (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              style={accentColor ? { borderLeftColor: accentColor } : undefined}
              className="block border border-line border-l-8 p-6 hover:border-gold"
            >
              <p className="font-display text-lg tracking-wide-jp">
                <BrandName name={brand.name} reading={brand.reading} />
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-charcoal-soft">
                {brand.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
