"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCancelOrder, computeCancellationFee } from "@/lib/cancellation";

export async function cancelOrder(orderId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("ログインが必要です");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { rentalBookings: true },
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error("注文が見つかりません");
  }
  if (!canCancelOrder(order)) {
    throw new Error("この注文はキャンセルできません（発送後、またはキャンセル済みの可能性があります）");
  }

  const fee = computeCancellationFee(order);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { cancelledAt: new Date(), cancellationFee: fee },
    }),
    prisma.rentalBooking.updateMany({
      where: { orderId },
      data: { status: "CANCELLED" },
    }),
  ]);

  revalidatePath("/account");
}
