import { auth } from "@/lib/auth";
import { ContactForm } from "@/components/ContactForm";

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-xs tracking-wide-jp text-gold">CONTACT</p>
      <h1 className="font-display mt-2 text-2xl">お問い合わせ</h1>
      <p className="mt-4 text-sm leading-relaxed text-charcoal-soft">
        商品やレンタル、セミオーダー・フルオーダーについてなど、お気軽にお問い合わせください。
      </p>

      <ContactForm
        defaultName={session?.user?.name ?? ""}
        defaultEmail={session?.user?.email ?? ""}
      />
    </div>
  );
}
