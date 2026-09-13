import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function NewsPage() {
  const posts = await prisma.newsPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs tracking-wide-jp text-gold">NEWS / CAMPAIGN</p>
      <h1 className="font-display mt-2 text-2xl">お知らせ・キャンペーン</h1>

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/news/${post.slug}`}
              className="flex flex-col gap-1 py-4 hover:text-gold sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="text-xs text-charcoal-soft">
                {formatDate(post.publishedAt)}
              </span>
              <span className="text-xs tracking-wide-jp text-gold">
                {post.category === "CAMPAIGN" ? "CAMPAIGN" : "NEWS"}
              </span>
              <span className="text-sm">{post.title}</span>
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="py-8 text-center text-sm text-charcoal-soft">
            お知らせはまだありません。
          </li>
        )}
      </ul>
    </div>
  );
}
