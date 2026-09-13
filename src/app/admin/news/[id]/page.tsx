import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewsPostForm } from "@/components/admin/NewsPostForm";
import { updateNewsPost } from "@/app/admin/actions";

export default async function EditNewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  const action = updateNewsPost.bind(null, post.id);

  return (
    <div>
      <h1 className="font-display text-2xl">お知らせ編集</h1>
      <NewsPostForm post={post} action={action} />
    </div>
  );
}
