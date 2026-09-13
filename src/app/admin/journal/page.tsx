import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { deleteJournalPost } from "@/app/admin/actions";

export default async function AdminJournalPage() {
  const posts = await prisma.journalPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">JOURNAL管理</h1>
        <Link
          href="/admin/journal/new"
          className="border border-charcoal bg-charcoal px-4 py-2 text-xs tracking-wide-jp text-white hover:bg-charcoal/90"
        >
          + 新規投稿
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left text-charcoal-soft">
              <th className="py-2 pr-4">公開日</th>
              <th className="py-2 pr-4">タイトル</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-line/60">
                <td className="py-2 pr-4">{formatDate(post.publishedAt)}</td>
                <td className="py-2 pr-4">{post.title}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/journal/${post.id}`}
                      className="text-gold hover:underline"
                    >
                      編集
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteJournalPost(post.id);
                      }}
                    >
                      <button type="submit" className="text-red-600 hover:underline">
                        削除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-charcoal-soft">
                  JOURNALの投稿はまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
