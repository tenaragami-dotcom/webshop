"use client";

import { useState } from "react";

const SUBJECTS = [
  "商品について",
  "レンタルについて",
  "セミオーダー・フルオーダーについて",
  "ご注文について",
  "その他",
];

export function ContactForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "送信に失敗しました。");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-10 border border-line bg-blush/40 p-8 text-center">
        <p className="font-display text-lg">お問い合わせを受け付けました</p>
        <p className="mt-2 text-sm text-charcoal-soft">
          内容を確認のうえ、ご入力いただいたメールアドレスへご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
        お問い合わせ内容の種類
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs">
        お問い合わせ内容
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-charcoal bg-charcoal py-3 text-xs tracking-wide-jp text-white hover:bg-charcoal/90 disabled:opacity-50"
      >
        {submitting ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
