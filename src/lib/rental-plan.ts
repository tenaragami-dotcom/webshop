export type RentalPlanType = "STANDARD" | "TRY_ON";

export type RentalPlanProduct = {
  priceRental: number | null;
  rentalBaseDays: number;
  rentalExtensionPricePerDay: number | null;
  rentalMaxExtensionDays: number;
  tryOnPlanPrice: number | null;
  tryOnPlanDays: number;
};

export function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const MIN_BOOKING_LEAD_DAYS = 10;

export function earliestBookableDate(): string {
  return addDaysStr(todayStr(), MIN_BOOKING_LEAD_DAYS);
}

export function planBaseDays(planType: RentalPlanType, product: RentalPlanProduct): number {
  return planType === "TRY_ON" ? product.tryOnPlanDays : product.rentalBaseDays;
}

export function computeRentalEnd(
  startDate: string,
  planType: RentalPlanType,
  extensionDays: number,
  product: RentalPlanProduct
): string {
  const base = planBaseDays(planType, product);
  const extra = planType === "TRY_ON" ? 0 : extensionDays;
  return addDaysStr(startDate, base - 1 + extra);
}

export function computeRentalPrice(
  planType: RentalPlanType,
  extensionDays: number,
  product: RentalPlanProduct
): number | null {
  if (planType === "TRY_ON") {
    return product.tryOnPlanPrice ?? null;
  }
  if (product.priceRental === null) return null;
  return product.priceRental + extensionDays * (product.rentalExtensionPricePerDay ?? 0);
}

export function availablePlanTypes(product: RentalPlanProduct): RentalPlanType[] {
  const plans: RentalPlanType[] = [];
  if (product.priceRental !== null) plans.push("STANDARD");
  if (product.tryOnPlanPrice !== null) plans.push("TRY_ON");
  return plans;
}

export function nightsDaysLabel(days: number): string {
  return `${Math.max(days - 1, 0)}泊${days}日`;
}

export function planLabel(planType: RentalPlanType, product: RentalPlanProduct): string {
  if (planType === "STANDARD") {
    return `標準プラン（${nightsDaysLabel(product.rentalBaseDays)}基本レンタルプラン）`;
  }
  return "ご試着プラン";
}
