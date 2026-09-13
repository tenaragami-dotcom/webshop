"use client";

import { useRef, useState } from "react";
import type { NewsPost } from "@prisma/client";

type Props = {
  post?: NewsPost;
  action: (formData: FormData) => Promise<void>;
};

function toDateInputValue(date?: Date) {
  const d = date ?? new Date();
  return d.toISOString().slice(0, 10);
}

export function NewsPostForm({ post, action }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState(post?.body ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "アップロードに失敗しました。");
        return;
      }

      const snippet = `![${file.name}](${data.url})`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? body.length;
        const end = textarea.selectionEnd ?? body.length;
        const next = body.slice(0, start) + snippet + body.slice(end);
        setBody(next);
        requestAnimationFrame(() => {
          textarea.focus();
          const pos = start + snippet.length;
          textarea.setSelectionRange(pos, pos);
        });
      } else {
        setBody((b) => b + snippet);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="mt-6 max-w-xl space-y-4">
      <label className="block text-xs">
        タイトル
        <input
          required
          name="title"
          defaultValue={post?.title}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
        />
      </label>

      <div>
        <label className="block text-xs">
          本文
          <textarea
            ref={textareaRef}
            required
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border border-line px-3 py-1.5 text-xs hover:border-gold disabled:opacity-50"
          >
            {uploading ? "アップロード中..." : "＋ 画像を挿入"}
          </button>
          <p className="text-[11px] text-charcoal-soft">
            カーソル位置に画像を挿入します（JPEG/PNG/WebP/GIF、5MBまで）
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelected}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      <div className="flex gap-4">
        <label className="block flex-1 text-xs">
          区分
          <select
            name="category"
            defaultValue={post?.category ?? "NEWS"}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          >
            <option value="NEWS">NEWS</option>
            <option value="CAMPAIGN">CAMPAIGN</option>
          </select>
        </label>
        <label className="block flex-1 text-xs">
          公開日
          <input
            type="date"
            name="publishedAt"
            defaultValue={toDateInputValue(post?.publishedAt)}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
          />
        </label>
      </div>

      <button
        type="submit"
        className="border border-charcoal bg-charcoal px-6 py-2.5 text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
      >
        保存する
      </button>
    </form>
  );
}
