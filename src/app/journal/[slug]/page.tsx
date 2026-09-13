import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { renderBodyWithImages } from "@/lib/render-body";

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.journalPost.findUnique({ where: { slug } });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/journal" className="text-xs text-charcoal-soft hover:text-gold">
        ← JOURNAL一覧へ
      </Link>

      <p className="mt-6 text-xs tracking-wide-jp text-gold">
        JOURNAL ／ {formatDate(post.publishedAt)}
      </p>
      <h1 className="font-display mt-2 text-2xl">{post.title}</h1>
      <div className="mt-6 space-y-4">{renderBodyWithImages(post.body)}</div>
    </div>
  );
}
