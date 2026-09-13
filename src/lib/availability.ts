import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED"] as const;

export async function getBookedRanges(productId: string) {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      productId,
      status: { in: [...ACTIVE_STATUSES] },
      endDate: { gte: today },
    },
    select: { startDate: true, endDate: true },
    orderBy: { startDate: "asc" },
  });
  return bookings;
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export async function isRangeAvailable(
  productId: string,
  start: Date,
  end: Date
): Promise<boolean> {
  const booked = await getBookedRanges(productId);
  return !booked.some((b) => rangesOverlap(start, end, b.startDate, b.endDate));
}
