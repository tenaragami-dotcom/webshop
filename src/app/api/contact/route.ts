import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容をご確認ください" }, { status: 400 });
  }
  const data = parsed.data;

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
