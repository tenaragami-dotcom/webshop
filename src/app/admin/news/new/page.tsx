import { NewsPostForm } from "@/components/admin/NewsPostForm";
import { createNewsPost } from "@/app/admin/actions";

export default function NewNewsPostPage() {
  return (
    <div>
      <h1 className="font-display text-2xl">新規お知らせ投稿</h1>
      <NewsPostForm action={createNewsPost} />
    </div>
  );
}
