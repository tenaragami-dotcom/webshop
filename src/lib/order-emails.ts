import { prisma } from "@/lib/prisma";
import { addDaysStr } from "@/lib/rental-plan";
import {
  sendBankTransferInstructions,
  sendNewOrderNotification,
  sendOrderConfirmation,
} from "@/lib/email";

const PAYMENT_METHOD_LABEL = {
  CREDIT_CARD: "クレジットカード決済",
  BANK_TRANSFER: "銀行振込",
} as const;

const PLAN_LABEL = {
  STANDARD: "標準プラン",
  TRY_ON: "ご試着プラン",
} as const;

function yen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

// レンタル日付はUTC 0時で保存しているため、UTCのまま日付文字列にする
function ymd(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}

function jstDateTime(date: Date): string {
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: true } },
      rentalBookings: { include: { product: true } },
    },
  });
}

type LoadedOrder = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

function buildOrderText(order: LoadedOrder): { header: string; details: string } {
  const header = [
    `注文番号: ${order.id}`,
    `ご注文日時: ${jstDateTime(order.createdAt)}`,
    `お支払い方法: ${PAYMENT_METHOD_LABEL[order.paymentMethod]}`,
  ].join("\n");

  const itemLines = order.items.map((item) => {
    const variant = item.variantName ? `（${item.variantName}）` : "";
    const kind = item.type === "RENTAL" ? "レンタル" : "購入";
    const lines = [
      `・${item.product.name}${variant}［${kind}］ ${yen(item.price)} × ${item.quantity}　${yen(item.price * item.quantity)}`,
    ];
    if (item.giftWrap) lines.push("　ギフトラッピングあり");
    return lines.join("\n");
  });

  const totals: string[] = [];
  if (order.discountAmount && order.discountAmount > 0) {
    totals.push(`クーポン割引: −${yen(order.discountAmount)}`);
  }
  totals.push(`お支払い合計（税込）: ${yen(order.totalAmount)}`);

  const sections = [`【ご注文内容】\n${itemLines.join("\n")}\n\n${totals.join("\n")}`];

  if (order.rentalBookings.length > 0) {
    const bookingLines = order.rentalBookings.map((b) => {
      const start = ymd(b.startDate);
      const delivery =
        b.planType === "TRY_ON"
          ? start
          : addDaysStr(start.replaceAll("/", "-"), -2).replaceAll("-", "/");
      const extension = b.extensionDays > 0 ? `（${b.extensionDays}日延長）` : "";
      return [
        `・${b.product.name}（${PLAN_LABEL[b.planType]}）`,
        `　お届け予定日: ${delivery}`,
        `　ご利用日: ${start}`,
        `　返却日: ${ymd(b.endDate)}${extension}`,
      ].join("\n");
    });
    sections.push(`【レンタルご利用日程】\n${bookingLines.join("\n")}`);
  }

  sections.push(
    `【お届け先】\n${order.shippingName} 様\n${order.shippingAddress}\n電話番号: ${order.shippingPhone}`
  );

  return { header, details: sections.join("\n\n") };
}

// メール送信の失敗で、決済や注文の処理自体を失敗させない
async function safely(label: string, task: () => Promise<void>) {
  try {
    await task();
  } catch (e) {
    console.error(`[order-emails] ${label} failed:`, e);
  }
}

/** クレジットカード決済が完了したとき：お客様へ注文確認、店舗へ新規注文通知 */
export async function notifyOrderPaid(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order) return;
  const { header, details } = buildOrderText(order);

  await safely("order confirmation", () =>
    sendOrderConfirmation({
      toEmail: order.user.email,
      customerName: order.shippingName,
      header,
      details,
    })
  );
  await safely("new order notification", () =>
    sendNewOrderNotification({
      subject: `【新規注文】${yen(order.totalAmount)}（お支払い済み）#${order.id.slice(-8)}`,
      customerName: order.shippingName,
      customerEmail: order.user.email,
      status: "お支払い済み（クレジットカード決済）",
      header,
      details,
    })
  );
}

/** 銀行振込で注文されたとき：お客様へ振込案内（注文内容つき）、店舗へ新規注文通知（入金待ち） */
export async function notifyBankTransferOrder(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order) return;
  const { header, details } = buildOrderText(order);

  await safely("bank transfer instructions", () =>
    sendBankTransferInstructions({
      toEmail: order.user.email,
      customerName: order.shippingName,
      orderId: order.id,
      amount: order.totalAmount,
      header,
      details,
    })
  );
  await safely("new order notification", () =>
    sendNewOrderNotification({
      subject: `【新規注文】${yen(order.totalAmount)}（銀行振込・入金待ち）#${order.id.slice(-8)}`,
      customerName: order.shippingName,
      customerEmail: order.user.email,
      status: "入金待ち（銀行振込）",
      header,
      details,
    })
  );
}
