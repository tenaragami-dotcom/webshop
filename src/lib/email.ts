import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;
const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

/**
 * Email is abstracted the same way payment is: without a real RESEND_API_KEY
 * and destination address configured, this just logs to the console so the
 * contact flow still works end to end in local/demo environments. Supplying
 * real credentials switches to actually sending mail via Resend.
 */
export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!resendApiKey || !notifyEmail) {
    console.log(
      "[email] RESEND_API_KEY / CONTACT_NOTIFY_EMAIL not set — logging instead of sending:",
      params
    );
    return;
  }

  const resend = new Resend(resendApiKey);
  await resend.emails.send({
    from: `Atelier le ciel <${fromEmail}>`,
    to: notifyEmail,
    replyTo: params.email,
    subject: `【お問い合わせ】${params.subject}`,
    text: `お名前: ${params.name}\nメールアドレス: ${params.email}\n種類: ${params.subject}\n\n${params.message}`,
  });
}

export async function sendBankTransferInstructions(params: {
  toEmail: string;
  customerName: string;
  orderId: string;
  amount: number;
}) {
  const bankInfo = [
    "◯◯銀行 ◯◯支店",
    "普通　◯◯◯◯◯◯◯",
    "口座名義：アトリエ ルシエル（Atelier le ciel）",
  ].join("\n");

  const text = `${params.customerName} 様

この度はAtelier le cielにご注文いただき誠にありがとうございます。
以下の口座へお振込みをお願いいたします。

注文番号: ${params.orderId}
お振込み金額: ¥${params.amount.toLocaleString()}

【お振込み先】
${bankInfo}

恐れ入りますが、振込手数料はお客様のご負担にてお願いいたします。
ご入金確認後、担当者よりあらためてご連絡いたします。`;

  if (!resendApiKey) {
    console.log(
      "[email] RESEND_API_KEY not set — logging instead of sending bank transfer instructions:",
      { to: params.toEmail, text }
    );
    return;
  }

  const resend = new Resend(resendApiKey);
  await resend.emails.send({
    from: `Atelier le ciel <${fromEmail}>`,
    to: params.toEmail,
    subject: "【Atelier le ciel】お振込みのご案内",
    text,
  });
}
