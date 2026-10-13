import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;
const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

async function deliver(params: {
  label: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  if (!resendApiKey) {
    console.log(`[email] RESEND_API_KEY not set — logging instead of sending ${params.label}:`, {
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return;
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: `Atelier le ciel <${fromEmail}>`,
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.text,
  });
  if (error) {
    console.error(`[email] Failed to send ${params.label}:`, error);
  }
}

export async function sendOrderConfirmation(params: {
  toEmail: string;
  customerName: string;
  header: string;
  details: string;
}) {
  await deliver({
    label: "order confirmation",
    to: params.toEmail,
    replyTo: notifyEmail,
    subject: "【Atelier le ciel】ご注文ありがとうございます",
    text: `${params.customerName} 様

この度はAtelier le cielにご注文いただき、誠にありがとうございます。
ご注文を以下の内容で承りました。

${params.header}

${params.details}

ご不明な点がございましたら、このメールへの返信にてご連絡ください。

Atelier le ciel`,
  });
}

export async function sendNewOrderNotification(params: {
  subject: string;
  customerName: string;
  customerEmail: string;
  status: string;
  header: string;
  details: string;
}) {
  if (!notifyEmail) {
    console.log("[email] CONTACT_NOTIFY_EMAIL not set — logging instead of sending new order notification:", params);
    return;
  }

  await deliver({
    label: "new order notification",
    to: notifyEmail,
    replyTo: params.customerEmail,
    subject: params.subject,
    text: `新しいご注文が入りました。

お客様: ${params.customerName}（${params.customerEmail}）
状況: ${params.status}

${params.header}

${params.details}

管理画面: https://le-ciel.shop/admin/orders`,
  });
}

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
  const { error } = await resend.emails.send({
    from: `Atelier le ciel <${fromEmail}>`,
    to: notifyEmail,
    replyTo: params.email,
    subject: `【お問い合わせ】${params.subject}`,
    text: `お名前: ${params.name}\nメールアドレス: ${params.email}\n種類: ${params.subject}\n\n${params.message}`,
  });
  if (error) {
    console.error("[email] Failed to send contact notification:", error);
  }
}

export async function sendBankTransferInstructions(params: {
  toEmail: string;
  customerName: string;
  orderId: string;
  amount: number;
  header: string;
  details: string;
}) {
  const bankInfo = [
    "【三井住友銀行】",
    "オリーブDILL支店　普通　0374207",
    "口座名義：アダチ　トモミ",
    "",
    "【北洋銀行】",
    "厚別中央支店　普通　3600802",
    "口座名義：アダチ　トモミ",
    "",
    "【ゆうちょ銀行】",
    "九〇八店　普通　5389737",
    "口座名義：アダチ　トモミ",
  ].join("\n");

  const text = `${params.customerName} 様

この度はAtelier le cielにご注文いただき誠にありがとうございます。
以下の口座へお振込みをお願いいたします。

注文番号: ${params.orderId}
お振込み金額: ¥${params.amount.toLocaleString()}

【お振込み先】
${bankInfo}

恐れ入りますが、振込手数料はお客様のご負担にてお願いいたします。
ご入金確認後、担当者よりあらためてご連絡いたします。

────────────────
${params.header}

${params.details}`;

  await deliver({
    label: "bank transfer instructions",
    to: params.toEmail,
    replyTo: notifyEmail,
    subject: "【Atelier le ciel】お振込みのご案内",
    text,
  });
}
