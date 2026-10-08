import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Vercelのサーバーレス関数はリクエストボディが約4.5MBまでのため、それ未満に制限する
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "対応していない画像形式です（JPEG/PNG/WebP/GIFのみ）" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "ファイルサイズは4MB以内にしてください" },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.${ext}`;

  // トークン未設定のローカル開発時だけ、従来通りpublic/配下に保存する
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "news");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/news/${filename}` });
  }

  try {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("[upload] Vercel Blob upload failed:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `画像のアップロードに失敗しました（${detail}）` },
      { status: 500 }
    );
  }
}
