import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

type SearchParams = {
  type?: string;
  category?: string;
  brand?: string;
  page?: string;
};

function buildQuery(params: SearchParams, overrides: Partial<SearchParams>) {
  const next = { ...params, ...overrides };
  const usp = new URLSearchParams();
  if (next.type) usp.set("type", next.type);
  if (next.category) usp.set("category", next.category);
  if (next.brand) usp.set("brand", next.brand);
  if (next.page && next.page !== "1") usp.set("page", next.page);
  const qs = usp.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    brand: { excludeFromCatalog: false },
  };
  if (params.type === "rental") where.isRentable = true;
  if (params.type === "sell") where.isSellable = true;
  if (params.category) where.category = { slug: params.category };
  if (params.brand) where.brand = { slug: params.brand, excludeFromCatalog: false };

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany(),
    prisma.brand.findMany({
      where: { excludeFromCatalog: false },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-2xl tracking-wide-jp">ALL ITEM</h1>

      <div className="mt-6 flex flex-wrap gap-2 text-xs tracking-wide-jp">
        {[
          { key: "type", value: undefined, label: "ALL" },
          { key: "type", value: "rental", label: "RENTAL" },
          { key: "type", value: "sell", label: "SELL" },
        ].map((opt) => {
          const active =
            opt.value === undefined ? !params.type : params.type === opt.value;
          return (
            <Link
              key={opt.label}
              href={buildQuery(params, { type: opt.value, page: undefined })}
              className={`border px-4 py-1.5 ${
                active ? "border-charcoal bg-charcoal text-white" : "border-line"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-4 text-xs text-charcoal-soft">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gold">CATEGORY</span>
          <Link
            href={buildQuery(params, { category: undefined, page: undefined })}
            className={!params.category ? "font-bold text-charcoal" : ""}
          >
            すべて
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildQuery(params, { category: c.slug, page: undefined })}
              className={params.category === c.slug ? "font-bold text-charcoal" : ""}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gold">BRAND</span>
          <Link
            href={buildQuery(params, { brand: undefined, page: undefined })}
            className={!params.brand ? "font-bold text-charcoal" : ""}
          >
            すべて
          </Link>
          {brands.map((b) => (
            <Link
              key={b.id}
              href={buildQuery(params, { brand: b.slug, page: undefined })}
              className={params.brand === b.slug ? "font-bold text-charcoal" : ""}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-charcoal-soft">
          該当する商品が見つかりませんでした。
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4 text-xs tracking-wide-jp">
          <Link
            href={buildQuery(params, { page: String(Math.max(1, page - 1)) })}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none text-charcoal-soft/40" : ""}
          >
            « PREV
          </Link>
          <span>
            {page} / {totalPages}
          </span>
          <Link
            href={buildQuery(params, { page: String(Math.min(totalPages, page + 1)) })}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none text-charcoal-soft/40" : ""}
          >
            NEXT »
          </Link>
        </div>
      )}
    </div>
  );
}
