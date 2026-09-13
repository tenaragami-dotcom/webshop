import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "@/app/admin/actions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">カテゴリー管理</h1>
        <Link
          href="/admin/categories/new"
          className="border border-charcoal bg-charcoal px-4 py-2 text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
        >
          + 新規カテゴリー
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left text-charcoal-soft">
              <th className="py-2 pr-4">カテゴリー名</th>
              <th className="py-2 pr-4">商品数</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-line/60">
                <td className="py-2 pr-4">{c.name}</td>
                <td className="py-2 pr-4">{c._count.products}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="text-gold hover:underline"
                    >
                      編集
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteCategory(c.id);
                      }}
                    >
                      <button
                        type="submit"
                        disabled={c._count.products > 0}
                        className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-charcoal-soft/50"
                        title={
                          c._count.products > 0
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
