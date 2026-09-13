import type { Metadata } from "next";
import { Shippori_Mincho, Noto_Sans_JP, Italiana } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Atelier le ciel（アトリエ・ル・シエル） | アクセサリー レンタル&販売",
  description:
    "厳選されたハンドメイドアクセサリー・ティアラのレンタル&販売ショップ Atelier le ciel。ご試着プランも承っております。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shipporiMincho.variable} ${notoSansJP.variable} ${italiana.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
