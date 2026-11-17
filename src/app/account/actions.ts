"use server";

import bcrypt from "bcryptjs";
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

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "ログインが必要です" };
  }

  // bcryptは72バイトを超える部分を無視するため、上限を72文字にしている
  if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 72) {
    return { ok: false, error: "新しいパスワードは8文字以上72文字以内で入力してください" };
  }
  if (typeof currentPassword !== "string" || currentPassword === newPassword) {
    return { ok: false, error: "新しいパスワードは、現在のパスワードと異なるものにしてください" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return { ok: false, error: "現在のパスワードが正しくありません" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true };
}
