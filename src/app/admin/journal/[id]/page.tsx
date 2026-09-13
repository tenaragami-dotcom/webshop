import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalPostForm } from "@/components/admin/JournalPostForm";
import { updateJournalPost } from "@/app/admin/actions";

export default async function EditJournalPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.journalPost.findUnique({ where: { id } });
  if (!post) notFound();

  const action = updateJournalPost.bind(null, post.id);

  return (
    <div>
      <h1 className="font-display text-2xl">JOURNAL編集</h1>
      <JournalPostForm post={post} action={action} />
    </div>
  );
}
