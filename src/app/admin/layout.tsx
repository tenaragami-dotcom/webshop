import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

const NAV = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/products", label: "商品管理" },
  { href: "/admin/brands", label: "ブランド管理" },
  { href: "/admin/categories", label: "カテゴリー管理" },
  { href: "/admin/news", label: "お知らせ管理" },
  { href: "/admin/journal", label: "JOURNAL管理" },
  { href: "/admin/bookings", label: "レンタル予約" },
  { href: "/admin/contact", label: "お問い合わせ管理" },
  { href: "/admin/orders", label: "注文管理" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-44 flex-shrink-0">
        <p className="font-display text-lg">ADMIN</p>
        <nav className="mt-6 flex flex-col gap-2 text-xs tracking-wide-jp">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
