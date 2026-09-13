import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { brand: true, category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="border border-charcoal bg-charcoal px-4 py-2 text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
        >
          + 新規商品
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left text-charcoal-soft">
              <th className="py-2 pr-4">商品名</th>
              <th className="py-2 pr-4">ブランド</th>
              <th className="py-2 pr-4">カテゴリー</th>
              <th className="py-2 pr-4">販売価格</th>
              <th className="py-2 pr-4">レンタル価格</th>
              <th className="py-2 pr-4">在庫</th>
              <th className="py-2 pr-4">状態</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line/60">
                <td className="py-2 pr-4">{p.name}</td>
                <td className="py-2 pr-4">{p.brand.name}</td>
                <td className="py-2 pr-4">{p.category.name}</td>
                <td className="py-2 pr-4">
                  {p.priceSell !== null ? formatPrice(p.priceSell) : "-"}
                </td>
                <td className="py-2 pr-4">
                  {p.priceRental !== null ? formatPrice(p.priceRental) : "-"}
                </td>
                <td className="py-2 pr-4">
                  {p.variants.length > 0
                    ? `${p.variants.reduce((sum, v) => sum + v.stockQuantity, 0)}（色別）`
                    : p.stockQuantity}
                </td>
                <td className="py-2 pr-4">{p.status}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-gold hover:underline">
                      編集
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteProduct(p.id);
                      }}
                    >
                      <button type="submit" className="text-red-600 hover:underline">
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
