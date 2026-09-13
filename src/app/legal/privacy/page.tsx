const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. 個人情報の定義",
    body: "本ポリシーにおいて「個人情報」とは、個人情報保護法に定める個人情報を指し、氏名・住所・電話番号・メールアドレスなど、特定の個人を識別できる情報をいいます。",
  },
  {
    title: "2. 取得する情報",
    body: "当店は、会員登録、ご注文、お問い合わせの際に、氏名・住所・電話番号・メールアドレス・お支払い情報等をお客様よりご提供いただきます。",
  },
  {
    title: "3. 利用目的",
    body: "取得した個人情報は、商品の発送・レンタル手続き、決済処理、お問い合わせへの回答、キャンペーン等のご案内、本サービスの改善のために利用します。",
  },
  {
    title: "4. 第三者提供",
    body: "当店は、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。ただし、商品の配送や決済処理を委託する事業者に対し、業務遂行に必要な範囲で情報を提供する場合があります。",
  },
  {
    title: "5. 決済情報の取り扱い",
    body: "クレジットカード情報は決済代行会社（Stripe）を通じて処理され、当店のサーバーには保存されません。",
  },
  {
    title: "6. Cookieの利用",
    body: "当店ウェブサイトでは、カート機能等の提供のためCookieを利用する場合があります。ブラウザの設定によりCookieを無効化することも可能ですが、一部機能がご利用いただけなくなる場合があります。",
  },
  {
    title: "7. 開示・訂正・削除請求",
    body: "お客様は、当店が保有するご自身の個人情報について、開示・訂正・削除を請求することができます。お問い合わせ窓口までご連絡ください。",
  },
  {
    title: "8. プライバシーポリシーの変更",
    body: "当店は、必要に応じて本ポリシーの内容を変更することがあります。変更後の内容は、本ウェブサイトに掲載した時点から効力を生じるものとします。",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs tracking-wide-jp text-gold">LEGAL</p>
      <h1 className="font-display mt-2 text-2xl">プライバシーポリシー</h1>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="font-display text-base">{section.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
