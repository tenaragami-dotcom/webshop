"use client";

import { useRef, useState } from "react";
import { PlaceholderImage } from "@/components/PlaceholderImage";

type ImageEntry = {
  key: string;
  seed: string;
  url: string | null;
};

export function ProductImagesField({
  initialImages,
}: {
  initialImages: { seed: string; url: string | null }[];
}) {
  const [images, setImages] = useState<ImageEntry[]>(
    initialImages.map((img, i) => ({ key: `existing-${i}`, seed: img.seed, url: img.url }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImages((prev) => [
        ...prev,
        { key: crypto.randomUUID(), seed: `upload-${crypto.randomUUID()}`, url: data.url },
      ]);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(key: string) {
    setImages((prev) => prev.filter((img) => img.key !== key));
  }

  return (
    <div>
      <p className="text-xs">商品画像</p>

      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.key} className="relative">
              <PlaceholderImage
                seed={img.seed}
                url={img.url}
                width={90}
                height={112}
                className="h-28 w-[90px] border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.key)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-[11px] text-white"
                aria-label="この画像を削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border border-line px-3 py-1.5 text-xs hover:border-gold disabled:opacity-50"
        >
          {uploading ? "アップロード中..." : "＋ 画像を追加"}
        </button>
        <p className="text-[11px] text-charcoal-soft">JPEG/PNG/WebP/GIF、5MBまで</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelected}
        className="hidden"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {images.map((img) => (
        <input key={img.key} type="hidden" name="imageSeed" value={img.seed} />
      ))}
      {images.map((img) => (
        <input key={img.key} type="hidden" name="imageUrl" value={img.url ?? ""} />
      ))}
    </div>
  );
}
