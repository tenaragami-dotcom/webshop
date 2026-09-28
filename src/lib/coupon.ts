import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const TRY_ON_COUPON_DISCOUNT_PERCENT = 10;
export const TRY_ON_COUPON_VALID_MONTHS = 6;

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function couponExpiresAt(from: Date = new Date()): Date {
  return addMonths(from, TRY_ON_COUPON_VALID_MONTHS);
}

export function generateCouponCode(): string {
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `TRYON-${random}`;
}

export type EligibleCoupon = {
  id: string;
  discountPercent: number;
  expiresAt: Date;
  usedAt: Date | null;
};

export function isCouponUsable(coupon: EligibleCoupon, now: Date = new Date()): boolean {
  return !coupon.usedAt && coupon.expiresAt > now;
}

// ご試着プランのレンタルが支払い完了になったタイミングで、次回「標準プラン」専用の
// 10%OFFクーポンを1枚発行する。同じ注文からは1枚しか発行しない（sourceOrderIdでユニーク制約）。
export async function issueTryOnCouponIfEligible(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { rentalBookings: true },
  });
  if (!order || order.type !== "RENTAL") return;
  if (!order.rentalBookings.some((b) => b.planType === "TRY_ON")) return;

  try {
    await prisma.coupon.create({
      data: {
        code: generateCouponCode(),
        userId: order.userId,
        discountPercent: TRY_ON_COUPON_DISCOUNT_PERCENT,
        sourceOrderId: order.id,
        expiresAt: couponExpiresAt(),
      },
    });
  } catch (e) {
    // sourceOrderId のユニーク制約違反 = 発行済み。無視してよい。
    if (!(e instanceof Error && e.message.includes("Unique constraint"))) {
      throw e;
    }
  }
}
