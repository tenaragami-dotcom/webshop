import { JournalPostForm } from "@/components/admin/JournalPostForm";
import { createJournalPost } from "@/app/admin/actions";

export default function NewJournalPostPage() {
  return (
    <div>
      <h1 className="font-display text-2xl">新規JOURNAL投稿</h1>
      <JournalPostForm action={createJournalPost} />
    </div>
  );
}
