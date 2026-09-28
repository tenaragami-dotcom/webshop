const ITEMS: { label: string; value: string }[] = [
  { label: "販売業者", value: "安達 知美（Atelier le ciel主宰）" },
  { label: "運営統括責任者", value: "安達 知美" },
  { label: "所在地", value: "〒047-0002 北海道小樽市潮見台1-13-7" },
  { label: "電話番号", value: "090-1524-4030（受付時間: 平日11:00〜18:00）" },
  { label: "メールアドレス", value: "le.ciel.1970@gmail.com" },
  { label: "販売価格", value: "各商品ページに表示する価格（すべて税込）" },
  {
    label: "商品代金以外の必要料金",
    value:
      "送料はご購入の場合は無料です。標準レンタルの場合は送料は無料ですが、返却される際の送料はお客様のご負担となります。ご試着レンタルプランの場合は、送料・返却される際の送料ともお客様のご負担となります。",
  },
  {
    label: "お支払い方法",
    value: "クレジットカード決済（Stripe）、銀行振込",
  },
  {
    label: "お支払い時期",
    value:
      "クレジットカード決済の場合はご注文確定時に決済されます。銀行振込の場合はご注文確定後7日以内にお振込みください。",
  },
  {
    label: "商品の引き渡し時期",
    value:
      "ご購入商品：ご注文およびご入金確認後5営業日以内に発送。標準レンタルの場合：ご指定の利用開始日の2日前にお届け。ご試着レンタルの場合：ご指定の利用開始日にお届け。セミオーダー、フルオーダーの場合：商品によって異なりますので、別途お知らせいたします。",
  },
  {
    label: "返品・交換について",
    value:
      "商品の性質上、お客様都合による返品・交換はお受けできません。不良品の場合はお届け後5日以内にご連絡ください（6日以上経過した場合はご相談をお受けできません）。レンタル商品の延滞・破損・汚損については別途弁償費用が発生する場合があります。",
  },
  {
    label: "動作環境",
    value: "最新版のWebブラウザ（Chrome, Safari, Edge等）でのご利用を推奨します。",
  },
];

export default function TokushohoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs tracking-wide-jp text-gold">LEGAL</p>
      <h1 className="font-display mt-2 text-2xl">特定商取引法に基づく表記</h1>

      <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
        {ITEMS.map((item) => (
          <div key={item.label} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="text-xs text-charcoal-soft">{item.label}</dt>
            <dd className="leading-relaxed">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
