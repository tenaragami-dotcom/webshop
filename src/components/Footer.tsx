import Link from "next/link";
import { Logo } from "@/components/Logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "SHOPPING",
    links: [
      { href: "/products", label: "商品一覧" },
      { href: "/brands", label: "ブランド一覧" },
      { href: "/rental/how-to", label: "レンタルの流れ" },
      { href: "/rental/faq", label: "よくあるご質問" },
    ],
  },
  {
    title: "NEWS",
    links: [
      { href: "/news", label: "お知らせ・キャンペーン" },
      { href: "/journal", label: "JOURNAL" },
    ],
  },
  {
    title: "ABOUT",
    links: [
      { href: "/about", label: "Atelier le cielについて" },
      { href: "/contact", label: "お問い合わせ" },
      { href: "/account", label: "マイページ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Logo id="footer-logo" markSize={26} wordmarkClassName="text-xl" />
          <p className="mt-3 text-xs leading-relaxed text-charcoal-soft">
            ハンドメイドのコスチュームジュエリーやアクセサリーのレンタル＆販売ショップです。
            他にもゴシック系、人形用、カジュアルなアクセサリーや雑貨もございます。セミ・フルオーダーも承ります。
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs tracking-wide-jp text-gold">{col.title}</p>
            <ul className="mt-3 space-y-2 text-xs text-charcoal-soft">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-4 py-4 text-center text-[11px] text-charcoal-soft">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/legal/terms" className="hover:text-gold">
            利用規約
          </Link>
          <Link href="/legal/privacy" className="hover:text-gold">
            プライバシーポリシー
          </Link>
          <Link href="/legal/tokushoho" className="hover:text-gold">
            特定商取引法に基づく表記
          </Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} Atelier le ciel ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
