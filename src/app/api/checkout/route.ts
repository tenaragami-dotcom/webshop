import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRangeAvailable } from "@/lib/availability";
import { createPayment } from "@/lib/payment";
import { sendBankTransferInstructions } from "@/lib/email";
import { computeRentalPrice, earliestBookableDate, MIN_BOOKING_LEAD_DAYS } from "@/lib/rental-plan";

const checkoutSchema = z.object({
  shippingName: z.string().min(1),
  shippingAddress: z.string().min(1),
  shippingPhone: z.string().min(1),
  paymentMethod: z.enum(["CREDIT_CARD", "BANK_TRANSFER"]).default("CREDIT_CARD"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        type: z.enum(["PURCHASE", "RENTAL"]),
        quantity: z.number().int().min(1).max(10),
        rentalStart: z.string().optional(),
        rentalEnd: z.string().optional(),
        variantName: z.string().optional(),
        planType: z.enum(["STANDARD", "TRY_ON"]).optional(),
        extensionDays: z.number().int().min(0).optional(),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が不正です" }, { status: 400 });
  }
  const data = parsed.data;

  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  const rentalPrices = new Map<number, number>();

  for (let index = 0; index < data.items.length; index++) {
    const item = data.items[index];
    const product = productMap.get(item.productId);
    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `商品が見つかりません: ${item.productId}` },
        { status: 400 }
      );
    }
    if (
      product.variants.length > 0 &&
      (!item.variantName || !product.variants.some((v) => v.name === item.variantName))
    ) {
      return NextResponse.json(
        { error: `${product.name} のカラーを選択してください` },
        { status: 400 }
      );
    }
    if (item.type === "PURCHASE") {
      if (!product.isSellable || product.priceSell === null) {
        return NextResponse.json(
          { error: `${product.name} は購入できません` },
          { status: 400 }
        );
      }
      const variant =
        product.variants.length > 0
          ? product.variants.find((v) => v.name === item.variantName)
          : null;
      const availableStock =
        product.variants.length > 0 ? (variant?.stockQuantity ?? 0) : product.stockQuantity;
      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} は在庫が不足しています（残り${availableStock}点）` },
          { status: 409 }
        );
      }
      totalAmount += product.priceSell * item.quantity;
    } else {
      if (!product.isRentable) {
        return NextResponse.json(
          { error: `${product.name} はレンタルできません` },
          { status: 400 }
        );
      }
      if (!item.rentalStart || !item.rentalEnd) {
        return NextResponse.json(
          { error: "レンタル日程が指定されていません" },
          { status: 400 }
        );
      }
      if (item.rentalStart < earliestBookableDate()) {
        return NextResponse.json(
          { error: `レンタルのお申し込みはご利用日の${MIN_BOOKING_LEAD_DAYS}日前までにお願いいたします` },
          { status: 400 }
        );
      }
      const planType = item.planType ?? "STANDARD";
      const extensionDays = item.extensionDays ?? 0;
      const price = computeRentalPrice(planType, extensionDays, product);
      if (price === null) {
        return NextResponse.json(
          { error: `${product.name} は選択したプランでご利用いただけません` },
          { status: 400 }
        );
      }

      const available = await isRangeAvailable(
        product.id,
        new Date(item.rentalStart),
        new Date(item.rentalEnd)
      );
      if (!available) {
        return NextResponse.json(
          { error: `${product.name} は選択日程が既に予約済みです` },
          { status: 409 }
        );
      }

      rentalPrices.set(index, price);
      totalAmount += price;
    }
  }

  const orderType = data.items.some((i) => i.type === "RENTAL") ? "RENTAL" : "PURCHASE";

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
        type: orderType,
        totalAmount,
        paymentStatus: "UNPAID",
        paymentMethod: data.paymentMethod,
        shippingName: data.shippingName,
        shippingAddress: data.shippingAddress,
        shippingPhone: data.shippingPhone,
        items: {
          create: data.items.map((item, index) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: item.productId,
              quantity: item.type === "PURCHASE" ? item.quantity : 1,
              price:
                item.type === "PURCHASE" ? product.priceSell! : rentalPrices.get(index)!,
              type: item.type,
              variantName: item.variantName,
            };
          }),
        },
      },
    });

    for (const item of data.items) {
      if (item.type === "RENTAL" && item.rentalStart && item.rentalEnd) {
        await tx.rentalBooking.create({
          data: {
            userId: session.user.id,
            productId: item.productId,
            orderId: created.id,
            variantName: item.variantName,
            startDate: new Date(item.rentalStart),
            endDate: new Date(item.rentalEnd),
            status: "PENDING",
            planType: item.planType ?? "STANDARD",
            extensionDays: item.extensionDays ?? 0,
          },
        });
      } else if (item.type === "PURCHASE") {
        const product = productMap.get(item.productId)!;
        if (product.variants.length > 0 && item.variantName) {
          await tx.productVariant.updateMany({
            where: { productId: item.productId, name: item.variantName },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }
      }
    }

    return created;
  });

  const origin = req.nextUrl.origin;

  if (data.paymentMethod === "BANK_TRANSFER") {
    if (session.user.email) {
      await sendBankTransferInstructions({
        toEmail: session.user.email,
        customerName: data.shippingName,
        orderId: order.id,
        amount: totalAmount,
      });
    }
    return NextResponse.json({
      redirectUrl: `${origin}/checkout/complete?orderId=${order.id}`,
      orderId: order.id,
    });
  }

  const payment = await createPayment({
    orderId: order.id,
    amount: totalAmount,
    description: `Atelier le ciel ご注文 #${order.id.slice(-8)}`,
    successUrl: `${origin}/checkout/complete?orderId=${order.id}`,
    cancelUrl: `${origin}/checkout`,
  });

  if (payment.status === "PAID") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", paymentRef: payment.paymentRef },
    });
    await prisma.rentalBooking.updateMany({
      where: { orderId: order.id },
      data: { status: "CONFIRMED" },
    });
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: payment.paymentRef },
    });
  }

  return NextResponse.json({ redirectUrl: payment.redirectUrl, orderId: order.id });
}
