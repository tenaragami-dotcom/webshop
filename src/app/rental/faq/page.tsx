const FAQS = [
  {
    q: "レンタル期間はどれくらいですか？",
    a: "商品ページでご指定いただいた利用開始日から返却日までがレンタル期間となります。挙式前日〜翌日発送が目安です。",
  },
  {
    q: "サイズ調整はできますか？",
    a: "ティアラ・ヘッドドレスは多くの商品でサイズ調整が可能です。詳細は商品詳細またはお問い合わせにてご確認ください。",
  },
  {
    q: "ご試着とは何ですか？",
    a: "ご自宅で気になる商品を試着いただけるサービスです。商品ページのご利用プランから「ご試着プラン」をお選びのうえお申し込みください。",
  },
  {
    q: "汚損・破損時はどうなりますか？",
    a: "通常使用の範囲内であれば追加費用はかかりません。著しい汚損・破損の場合は別途弁償費用が発生する場合がございます。",
  },
  {
    q: "返却方法を教えてください。",
    a: "商品に同梱の返却キットをご利用のうえ、返却期日までに発送してください。",
  },
];

export default function RentalFaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs tracking-wide-jp text-gold">FAQ</p>
      <h1 className="font-display mt-2 text-2xl">よくあるご質問</h1>

      <dl className="mt-10 divide-y divide-line border-y border-line">
        {FAQS.map((item) => (
          <div key={item.q} className="py-6">
            <dt className="flex gap-3 text-sm">
              <span className="text-gold">Q</span>
              {item.q}
            </dt>
            <dd className="mt-2 flex gap-3 text-sm leading-relaxed text-charcoal-soft">
              <span className="text-blush-dark">A</span>
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
