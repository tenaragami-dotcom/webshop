import Link from "next/link";

const STEPS = [
  {
    title: "1. 商品を選ぶ",
    body: "レンタル可能な商品からお選びください。お支払いは、銀行振込、クレジットカード払いよりお選びいただけます。販売商品とレンタル商品を同時にご購入いただく場合は、別送でのお届けとなります。",
  },
  {
    title: "2. 公的身分証のご提示",
    body: "ご注文後、当ショップよりお送りするご案内メールに沿って身分証をご提出いただきます。銀行振込をお選びいただいたお客様は、あわせてお振込みをお願いいたします。",
  },
  {
    title: "3. 発送前の最終確認",
    body: "お届け予定日の約1週間前に、メールにて最終確認のご連絡をさせていただきます。",
  },
  {
    title: "4. アイテムのお届け",
    body: "標準プランの場合、ご利用日2日前にアイテムをご自宅にお届けします。素敵なお時間をお過ごしください。\nご試着プランの場合は、ご利用当日のお届けになります。ご自宅で楽しい時間をお過ごしください。",
  },
  {
    title: "5. ご返却",
    body: "ご利用最終日正午（12:00）までにご返却手続きをお済ませください。送料はお客様にてご負担のうえ、元払いにてご返送をお願いいたします。\n次にお待ちのお客様がいらっしゃいますので、返却期限は厳守をお願いいたします。アイテム到着後、返却完了のご連絡をさせていただきます。",
  },
];

const TRY_ON_SECTIONS = [
  {
    title: "「ご試着プラン」について",
    items: [
      "1点につき¥1,980（3泊4日）",
      "ご試着プランでは往復の送料はお客様負担になります",
      "レンタルアイテム商品からお選びください",
      "お申し込み後のアイテム及び日程変更、キャンセルにつきましてはご遠慮ください",
      "1回の郵送で最大5点までご利用いただけます",
      "試着用としてあらかじめタグをつけさせていただきます。取り外さないでください",
      "ご試着プランはご自宅での利用に限らせて頂きます。屋外利用や挙式・写真撮影・パーティー利用・ヘアメイクリハーサル等、ご試着以外のご利用はNGとなります",
    ],
  },
  {
    title: "「ご試着プラン」特典",
    items: [
      "レンタル商品10%割引クーポンプレゼント",
      "クーポンのご利用はお一人様1回限りとさせていただきます",
      "クーポンはレンタル商品（ご試着プランを除く）のみ対象となり、販売商品は対象外とさせていただきます",
      "クーポンは有効期限がございます",
      "既にご予約済みのレンタルアイテムにつきましては割引対象外とさせていただきます",
    ],
  },
  {
    title: "「ご試着プラン」注意事項・利用規約",
    items: [
      "レンタル商品に限り、販売商品は対象外とさせていただきます",
      "ご試着はご自宅利用のみとさせていただきます。屋外や挙式・写真撮影・パーティー利用・リハーサル等のご試着以外のご利用が発覚した場合、またタグを外してご試着をされた場合、定価を申し受けます",
      "ヘアメイクリハーサルでのご利用もお控えください",
      "ご試着プランではご延長はできません",
      "レンタル品につき、お申し込み後は身分証明書類のご提示をお願いしております。トラブル防止のため、身分証明書類にて確認のとれたご住所のみにお届けとさせていただきます",
      "ご返却は、アイテムお届けの際に同梱しております返却伝票をご使用のうえ、ご返却日の正午（12:00）までに元払いにてお手続きを完了してください。",
      "ご返却が遅延された場合、1泊1アイテムにつき¥1,100のご延長料金を申し受けます。",
    ],
  },
];

export default function RentalHowToPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-2xl">アクセサリーレンタルについて</h1>

      <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal-soft">
        <p>
          当店ではアクセサリーレンタルも「標準プラン」と「ご試着プラン」の２種類を用意させて頂いております。
          標準プランはウエディング、パーティなど大切な１日に使用できるのに対し、
          ご試着プランはご自宅でサイズ感や重さをご確認頂くもので、ご自宅外での記念撮影等はご遠慮頂いております。
        </p>
        <p>
          まず、ご試着プランでアクセサリーを試着してみて、ウエディングやパーティなどに使うアクセサリーを選んで頂き、素敵な一日の準備にお役立てください。
        </p>
      </div>

      <p className="mt-12 text-xs tracking-wide-jp text-gold">HOW TO RENT</p>
      <h2 className="font-display mt-2 text-xl">レンタルの流れ</h2>

      <ol className="mt-6 space-y-8">
        {STEPS.map((step) => (
          <li key={step.title} className="border-l-2 border-gold pl-4">
            <p className="font-display text-lg">{step.title}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-charcoal-soft">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <section className="mt-16 border-t border-line pt-12">
        <p className="text-xs tracking-wide-jp text-gold">HOW TO TRY ON</p>
        <h2 className="font-display mt-2 text-xl">ご試着プランについて</h2>

        <ol className="mt-6 space-y-8">
          {TRY_ON_SECTIONS.map((sec) => (
            <li key={sec.title} className="border-l-2 border-gold pl-4">
              <p className="font-display text-lg">{sec.title}</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-charcoal-soft">
                {sec.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-12 flex gap-4 text-xs tracking-wide-jp">
        <Link href="/products?type=rental" className="border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-white">
          レンタル商品を見る
        </Link>
        <Link href="/rental/faq" className="border border-line px-6 py-3 hover:border-gold">
          よくあるご質問
        </Link>
      </div>
    </div>
  );
}
