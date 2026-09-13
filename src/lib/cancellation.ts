export type CancellableOrder = {
  totalAmount: number;
  cancelledAt: Date | null;
  rentalBookings: { startDate: Date; status: string }[];
};

function daysUntil(target: Date, from: Date): number {
  const ms = target.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

const ACTIVE_BOOKING_STATUSES = ["PENDING", "CONFIRMED"];

export function canCancelOrder(order: CancellableOrder): boolean {
  if (order.cancelledAt) return false;
  if (order.rentalBookings.length === 0) return false;
  return order.rentalBookings.every((b) => ACTIVE_BOOKING_STATUSES.includes(b.status));
}

export function earliestRentalStart(order: CancellableOrder): Date {
  return order.rentalBookings.reduce(
    (min, b) => (b.startDate < min ? b.startDate : min),
    order.rentalBookings[0].startDate
  );
}

// 第8条・第9条に定めるキャンセル料率：
// 30日以上前=30%、29〜14日前=50%、13日前以降（発送後を除く）=100%
export function cancellationFeeRate(order: CancellableOrder, now: Date = new Date()): number {
  const days = daysUntil(earliestRentalStart(order), now);
  if (days >= 30) return 0.3;
  if (days >= 14) return 0.5;
  return 1.0;
}

export function computeCancellationFee(order: CancellableOrder, now: Date = new Date()): number {
  const rate = cancellationFeeRate(order, now);
  return Math.round(order.totalAmount * rate);
}
