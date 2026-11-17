"use client";

import { useState } from "react";
import { changePassword } from "@/app/account/actions";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (next !== confirm) {
      setError("新しいパスワードが一致しません");
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePassword(current, next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(true);
    } catch {
      setError("パスワードの変更に失敗しました。時間をおいて再度お試しください");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-sm space-y-4">
      <label className="block text-xs">
        現在のパスワード
        <input
          required
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs">
        新しいパスワード（8文字以上72文字以内）
        <input
          required
          minLength={8}
          maxLength={72}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs">
        新しいパスワード（確認）
        <input
          required
          minLength={8}
          maxLength={72}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {done && <p className="text-xs text-gold">パスワードを変更しました。</p>}

      <button
        type="submit"
        disabled={submitting}
        className="border border-charcoal bg-charcoal px-6 py-2 text-xs tracking-wide-jp text-white hover:bg-charcoal/90 disabled:opacity-50"
      >
        {submitting ? "変更中..." : "パスワードを変更する"}
      </button>
    </form>
  );
}
