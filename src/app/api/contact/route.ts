import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";
import {
  CONTACT_MAX_LINKS,
  CONTACT_MESSAGE_MAX,
  CONTACT_MESSAGE_MIN,
  CONTACT_MIN_FILL_MS,
  CONTACT_SUBJECTS,
} from "@/lib/contact";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(CONTACT_MESSAGE_MIN).max(CONTACT_MESSAGE_MAX),
  website: z.string().optional(),
  elapsedMs: z.number().optional(),
});

function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容をご確認ください" }, { status: 400 });
  }
  const { website, elapsedMs, ...data } = parsed.data;

  // 人間は見えない欄に入力しない／ページを開いて数秒は入力にかかる。
  // ボットと判断した送信は、再試行や回避をさせないため、成功したように見せて破棄する。
  if (website || (elapsedMs !== undefined && elapsedMs < CONTACT_MIN_FILL_MS)) {
    return NextResponse.json({ id: "ok" });
  }
  if (elapsedMs === undefined) {
    return NextResponse.json(
      { error: "ページを再読み込みして、もう一度お試しください" },
      { status: 400 }
    );
  }

  if (countLinks(data.message) > CONTACT_MAX_LINKS) {
    return NextResponse.json(
      { error: "お問い合わせ内容にリンクを多く含めることはできません" },
      { status: 400 }
    );
  }

  const contact = await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message.replace(/\r\n/g, "\n"),
    },
  });

  // Best-effort: the inquiry is already saved, so a notification failure
  // shouldn't turn into an error for the person submitting the form.
  try {
    await sendContactNotification(data);
  } catch (err) {
    console.error("[email] failed to send contact notification:", err);
  }

  return NextResponse.json({ id: contact.id });
}
