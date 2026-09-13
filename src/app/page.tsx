import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { BrandName } from "@/components/BrandName";
import { formatDate } from "@/lib/format";
import { BRAND_TINTS } from "@/lib/brand-tints";

export default async function HomePage() {
  const [pickupProducts, brands, news, dollBrand] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", brand: { excludeFromCatalog: false } },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
      },
    }),
    prisma.brand.findMany({ take: 6, orderBy: { sortOrder: "asc" } }),
    prisma.newsPost.findMany({ take: 3, orderBy: { publishedAt: "desc" } }),
    prisma.brand.findFirst({ where: { name: "Poupée Chérie" } }),
  ]);

  return (
    <div>
      {dollBrand && (
        <div className="bg-paper px-4 py-3 text-center text-[11px] leading-relaxed text-charcoal-soft">
          人形用の商品の画像にはガラスの目の人形が表示されるため、苦手な方には見えないよう工夫してあります。
          人形用の商品をご覧になる場合は、BRANDから
          <Link
            href={`/brands/${dollBrand.slug}`}
            className="font-medium text-gold-dark underline underline-offset-2 hover:text-charcoal"
          >
            <BrandName name={dollBrand.name} reading={dollBrand.reading} />
          </Link>
          を開いてください。
        </div>
      )}

      <section className="relative flex h-[38vh] min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-blush via-ivory to-gold-light">
        <div className="text-center">
          <p className="text-xs tracking-wide-jp text-charcoal-soft">
            ACCESSORY RENTAL &amp; SELL
          </p>
          <h1 className="font-display mt-4 text-4xl tracking-wide-jp text-charcoal sm:text-5xl">
            Atelier le ciel
          </h1>
          <p className="mt-4 text-sm text-charcoal-soft">
            自分らしいスタイルが、ここに見つかる。
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block border border-charcoal px-8 py-3 text-xs tracking-wide-jp hover:bg-charcoal hover:text-white"
          >
            ALL ITEM
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl tracking-wide-jp">PICK UP</h2>
          <Link href="/products" className="text-xs tracking-wide-jp text-gold hover:underline">
            VIEW MORE
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {pickupProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display mb-8 text-2xl tracking-wide-jp">BRAND</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {brands.map((brand) => {
              const tint = BRAND_TINTS[brand.name];
              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  style={tint ? { backgroundColor: tint.bg } : undefined}
                  className="border border-line px-4 py-8 text-center transition hover:border-gold hover:opacity-90"
                >
                  <p
                    className="font-display text-sm tracking-wide-jp"
                    style={tint?.text ? { color: tint.text } : undefined}
                  >
                    <BrandName
                      name={brand.name}
                      reading={brand.reading}
                      stacked
                      readingStyle={tint?.sub ? { color: tint.sub } : undefined}
                    />
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl tracking-wide-jp">NEWS / CAMPAIGN</h2>
          <Link href="/news" className="text-xs tracking-wide-jp text-gold hover:underline">
            VIEW MORE
          </Link>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {news.map((post) => (
            <li key={post.id}>
              <Link
                href={`/news/${post.slug}`}
                className="flex flex-col gap-1 py-4 hover:text-gold sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="text-xs text-charcoal-soft">
                  {formatDate(post.publishedAt)}
                </span>
                <span className="text-xs tracking-wide-jp text-gold">
                  {post.category === "CAMPAIGN" ? "CAMPAIGN" : "NEWS"}
                </span>
                <span className="text-sm">{post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
