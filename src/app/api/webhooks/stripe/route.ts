import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe calls this endpoint directly when a payment completes, independent of
 * whether the customer's browser ever reaches /checkout/complete. This is the
 * source of truth for marking an order PAID in production — relying on the
 * success_url redirect alone would leave orders stuck UNPAID if the browser
 * closes, the network drops, or someone hits success_url without paying.
 */
export async function POST(req: NextRequest) {
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 501 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("missing stripe-signature header");
    const stripe = new Stripe(stripeSecretKey);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await markOrderPaid(orderId, session.id);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await markOrderFailed(orderId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function markOrderPaid(orderId: string, paymentRef: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentStatus === "PAID") return;

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID", paymentRef },
  });
  await prisma.rentalBooking.updateMany({
    where: { orderId },
    data: { status: "CONFIRMED" },
  });
}

async function markOrderFailed(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentStatus === "PAID") return;

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "FAILED" },
  });
  await prisma.rentalBooking.updateMany({
    where: { orderId },
    data: { status: "CANCELLED" },
  });
}
