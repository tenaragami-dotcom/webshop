import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/account/login?callbackUrl=/checkout");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-2xl tracking-wide-jp">CHECKOUT</h1>
      <CheckoutForm defaultName={session.user.name ?? ""} />
    </div>
  );
}
