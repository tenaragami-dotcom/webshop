"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label="メニューを開く"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
      >
        <span className="block h-px w-5 bg-charcoal" />
        <span className="block h-px w-5 bg-charcoal" />
        <span className="block h-px w-5 bg-charcoal" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-paper px-4 py-4 shadow-md">
          <nav className="flex flex-col gap-3 text-sm tracking-wide-jp">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-line/60 pb-2"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
