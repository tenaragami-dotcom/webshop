import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { looksLikeBot } from "@/lib/bot-check";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  // bcryptは72バイトを超える部分を無視するため、上限を72文字にしている
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(30).optional(),
  website: z.string().optional(),
  elapsedMs: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力内容をご確認ください（パスワードは8文字以上72文字以内）" },
      { status: 400 }
    );
  }
  const { name, email, password, phone, website, elapsedMs } = parsed.data;

  // ボットと判断した登録は、回避を試みられないよう成功したように見せて破棄する。
  if (looksLikeBot(website, elapsedMs)) {
    return NextResponse.json({ ok: true });
  }
  if (elapsedMs === undefined) {
    return NextResponse.json(
      { error: "ページを再読み込みして、もう一度お試しください" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "このメールアドレスは既に登録されています" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, phone: phone || undefined, role: "MEMBER" },
  });

  return NextResponse.json({ ok: true });
}
