import Link from "next/link";
import { auth } from "@/lib/auth";
import { CartCount } from "@/components/CartCount";
import { MobileNav } from "@/components/MobileNav";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/products", label: "ALL ITEM" },
  { href: "/brands", label: "BRAND" },
  { href: "/rental/how-to", label: "HOW TO RENT" },
  { href: "/news", label: "NEWS" },
  { href: "/journal", label: "JOURNAL" },
  { href: "/about", label: "ABOUT" },
];

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-xs text-charcoal-soft">
        <p className="hidden sm:block">大切な一日を、とっておきのアクセサリーで。</p>
        <div className="ml-auto flex items-center gap-4">
          {session?.user ? (
            <Link href="/account" className="hover:text-gold">
              MY PAGE（{session.user.name}）
            </Link>
          ) : (
            <Link href="/account/login" className="hover:text-gold">
              LOGIN
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-gold">
              ADMIN
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" aria-label="Atelier le ciel">
          <Logo id="header-logo" markSize={30} />
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] tracking-wide-jp text-charcoal md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-[13px] tracking-wide-jp hover:text-gold">
            CART
            <CartCount />
          </Link>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
