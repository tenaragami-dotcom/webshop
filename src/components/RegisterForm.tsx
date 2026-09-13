"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました。");
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        router.push("/account/login");
        return;
      }
      router.push("/account");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-xs">
        お名前
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>
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
        パスワード（8文字以上）
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs">
        電話番号（任意）
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-charcoal bg-charcoal py-3 text-xs tracking-wide-jp text-white hover:bg-charcoal/90 disabled:opacity-50"
      >
        {submitting ? "処理中..." : "登録する"}
      </button>
    </form>
  );
}
