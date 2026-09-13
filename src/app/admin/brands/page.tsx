import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteBrand } from "@/app/admin/actions";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">ブランド管理</h1>
        <Link
          href="/admin/brands/new"
          className="border border-charcoal bg-charcoal px-4 py-2 text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
        >
          + 新規ブランド
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left text-charcoal-soft">
              <th className="py-2 pr-4">ブランド名</th>
              <th className="py-2 pr-4">読み方</th>
              <th className="py-2 pr-4">紹介文</th>
              <th className="py-2 pr-4">商品数</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-line/60">
                <td className="py-2 pr-4">{b.name}</td>
                <td className="py-2 pr-4 text-charcoal-soft">{b.reading}</td>
                <td className="max-w-xs truncate py-2 pr-4 text-charcoal-soft">
                  {b.description}
                </td>
                <td className="py-2 pr-4">{b._count.products}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-3">
                    <Link href={`/admin/brands/${b.id}`} className="text-gold hover:underline">
                      編集
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteBrand(b.id);
                      }}
                    >
                      <button
                        type="submit"
                        disabled={b._count.products > 0}
                        className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-charcoal-soft/50"
                        title={
                          b._count.products > 0
                            ? "紐づく商品があるため削除できません"
                            : undefined
                        }
                      >
                        削除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
