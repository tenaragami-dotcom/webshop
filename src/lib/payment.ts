import Stripe from "stripe";

export type PaymentResult =
  | { status: "PAID"; paymentRef: string; redirectUrl: string }
  | { status: "REDIRECT"; redirectUrl: string; paymentRef: string };

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

/**
 * Payment is abstracted so the checkout flow works end to end even without
 * real Stripe credentials: without STRIPE_SECRET_KEY we fall back to a mock
 * provider that marks the order paid immediately. Supplying real test-mode
 * keys switches to an actual Stripe Checkout Session.
 *
 * When Stripe is configured, the order is left UNPAID here — it only becomes
 * PAID once Stripe confirms the payment via the /api/webhooks/stripe
 * endpoint (see that file for why the success_url redirect alone isn't
 * reliable enough to trust).
 */
export async function createPayment(params: {
  orderId: string;
  amount: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<PaymentResult> {
  if (!stripeSecretKey) {
    return {
      status: "PAID",
      paymentRef: `mock_${params.orderId}`,
      redirectUrl: params.successUrl,
    };
  }

  const stripe = new Stripe(stripeSecretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          unit_amount: params.amount,
          product_data: { name: params.description },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { orderId: params.orderId },
  });

  return {
    status: "REDIRECT",
    redirectUrl: session.url!,
    paymentRef: session.id,
  };
}
