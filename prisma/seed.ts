import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brands = [
  {
    name: "Lumière Blanc",
    slug: "lumiere-blanc",
    description:
      "光をまとうような繊細なパヴェディテールが特徴のインポートブランド。クラシックで上品なタイムレスなデザイン。",
  },
  {
    name: "Rosalind Atelier",
    slug: "rosalind-atelier",
    description:
      "英国発のハンドメイドヘッドピースブランド。ヴィンテージレースをモチーフにした温かみのあるデザインが人気。",
  },
  {
    name: "Petit Nuage",
    slug: "petit-nuage",
    description:
      "小さな雲のように軽やかなアクセサリーを届けるブランド。パールとリボンを使った可愛らしいラインナップ。",
  },
  {
    name: "Étoile Argentée",
    slug: "etoile-argentee",
    description:
      "星をモチーフにしたクリスタルティアラが看板商品。華やかなパーティーシーンにおすすめ。",
  },
  {
    name: "Camélia Blanc",
    slug: "camelia-blanc",
    description:
      "椿の花をイメージした上質なアクセサリーライン。天然パールを贅沢に使用したナチュラルテイスト。",
  },
] as const;

const categories = [
  { name: "ティアラ", slug: "tiara" },
  { name: "ブレスレット", slug: "bracelet" },
  { name: "イヤリング・ピアス", slug: "earrings" },
  { name: "ネックレス", slug: "necklace" },
] as const;

type ProductSeed = {
  name: string;
  brand: string;
  category: string;
  description: string;
  priceSell: number | null;
  priceRental: number | null;
  isSellable: boolean;
  isRentable: boolean;
  stockQuantity: number;
};

const productNames: Record<string, string[]> = {
  tiara: [
    "セレスティア ティアラ",
    "ミモザ クラシック ティアラ",
    "アリア パヴェ ティアラ",
    "フローレンス リーフ ティアラ",
    "ノクターン スター ティアラ",
  ],
  bracelet: [
    "ベルアミ バングルブレスレット",
    "シャルロット パールブレスレット",
    "リュミエール チェーンブレスレット",
    "ジャルダン フラワーブレスレット",
  ],
  earrings: [
    "パール ドロップ イヤリング",
    "クリスタル スタッド ピアス",
    "レース モチーフ イヤリング",
    "ミニマグノリア イヤリング",
    "スノードロップ ピアス",
  ],
  necklace: [
    "ロマンス パール ネックレス",
    "エクレール チョーカー",
    "プティ リボン ネックレス",
    "ミルフィーユ レイヤードネックレス",
  ],
};

function buildProducts(): ProductSeed[] {
  const list: ProductSeed[] = [];
  const brandNames = brands.map((b) => b.name);
  let brandIdx = 0;

  for (const category of categories) {
    const names = productNames[category.slug];
    names.forEach((name, i) => {
      const brand = brandNames[brandIdx % brandNames.length];
      brandIdx++;
      const mode = (i + brandIdx) % 3; // 0: rental only, 1: sell only, 2: both
      const basePrice = 8000 + ((i * 733 + brandIdx * 211) % 30000);
      const priceSell = mode !== 0 ? Math.round(basePrice / 100) * 100 : null;
      const priceRental =
        mode !== 1 ? Math.round((basePrice * 0.35) / 100) * 100 : null;

      list.push({
        name,
        brand,
        category: category.slug,
        description: `${brand}が手がける${name}。大切な一日を華やかに彩る一点です。素材・サイズ等の詳細はお問い合わせください。`,
        priceSell,
        priceRental,
        isSellable: priceSell !== null,
        isRentable: priceRental !== null,
        stockQuantity: 1 + (i % 3),
      });
    });
  }
  return list;
}

const newsPosts = [
  {
    title: "【重要】不審メールに関するお知らせ",
    slug: "news-phishing-alert",
    category: "NEWS" as const,
    body: "弊社を装った不審なメールが確認されております。お心当たりのないメールのリンクは開かず、ご不明な点がございましたらお問い合わせ窓口までご連絡ください。",
  },
  {
    title: "顔型別ティアラの選び方",
    slug: "news-tiara-guide",
    category: "NEWS" as const,
    body: "顔型に合わせたティアラ選びのポイントをご紹介します。丸顔・面長・卵型など、タイプ別のおすすめデザインを掲載しました。",
  },
  {
    title: "レンタルアクセサリー郵送試着ご案内開始のお知らせ",
    slug: "news-mail-fitting",
    category: "CAMPAIGN" as const,
    body: "ご自宅で試着いただける郵送試着サービスを開始しました。レンタルご成約で10%割引特典もございます。",
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.rentalBooking.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.newsPost.deleteMany();
  await prisma.user.deleteMany();

  const brandRecords = await Promise.all(
    brands.map((b) => prisma.brand.create({ data: b }))
  );
  const brandBySlugName = new Map(brandRecords.map((b) => [b.name, b]));

  const categoryRecords = await Promise.all(
    categories.map((c) => prisma.category.create({ data: c }))
  );
  const categoryBySlug = new Map(categoryRecords.map((c) => [c.slug, c]));

  const products = buildProducts();
  let productIndex = 0;
  for (const p of products) {
    productIndex++;
    const brand = brandBySlugName.get(p.brand)!;
    const category = categoryBySlug.get(p.category)!;
    const slug = `${category.slug}-${productIndex}`;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        brandId: brand.id,
        categoryId: category.id,
        priceSell: p.priceSell,
        priceRental: p.priceRental,
        isSellable: p.isSellable,
        isRentable: p.isRentable,
        stockQuantity: p.stockQuantity,
        status: "ACTIVE",
      },
    });

    await prisma.productImage.createMany({
      data: [0, 1, 2].map((i) => ({
        productId: product.id,
        seed: `${slug}-${i}`,
        order: i,
      })),
    });
  }

  await prisma.newsPost.createMany({ data: newsPosts });

  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  const memberPasswordHash = await bcrypt.hash("member1234", 10);

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      name: "管理者",
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "member@example.com",
      passwordHash: memberPasswordHash,
      name: "山田 花子",
      role: "MEMBER",
    },
  });

  console.log(`Seeded ${products.length} products, ${brands.length} brands.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
