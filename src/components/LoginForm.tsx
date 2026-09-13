"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("メールアドレスまたはパスワードが正しくありません。");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-xs">
        メールアドレス
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs">
        パスワード
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-charcoal bg-charcoal py-3 text-xs tracking-wide-jp text-white hover:bg-charcoal/90 disabled:opacity-50"
      >
        {submitting ? "処理中..." : "ログイン"}
      </button>

      <p className="text-center text-[11px] text-charcoal-soft">
        アカウントをお持ちでない方は{" "}
        <Link href="/account/register" className="text-gold hover:underline">
          新規登録
        </Link>
      </p>

      <div className="mt-6 border-t border-line pt-4 text-[11px] text-charcoal-soft">
        <p>デモ用アカウント</p>
        <p>会員: member@example.com / member1234</p>
        <p>管理者: admin@example.com / admin1234</p>
      </div>
    </form>
  );
}
