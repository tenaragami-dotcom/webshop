"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="border border-line px-4 py-2 text-xs tracking-wide-jp hover:border-gold"
    >
      ログアウト
    </button>
  );
}
