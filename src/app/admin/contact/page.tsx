import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { updateContactStatus, deleteContactMessage } from "@/app/admin/actions";

const STATUS_LABEL: Record<string, string> = {
  NEW: "未対応",
  RESPONDED: "対応済み",
};

export default async function AdminContactPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">お問い合わせ管理</h1>

      <div className="mt-6 space-y-4">
        {messages.map((m) => {
          const action = updateContactStatus.bind(null, m.id);
          return (
            <div key={m.id} className="border border-line p-4 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm">
                    {m.name}（{m.email}）
                  </p>
                  <p className="mt-1 text-charcoal-soft">
                    {formatDate(m.createdAt)} ／ {m.subject}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-charcoal-soft">{m.message}</p>
                </div>
                <form action={action} className="flex flex-shrink-0 items-center gap-2">
                  <select
                    name="status"
                    defaultValue={m.status}
                    className="border border-line px-2 py-1.5"
                  >
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="border border-charcoal px-3 py-1.5 hover:bg-charcoal hover:text-white"
                  >
                    更新
                  </button>
                </form>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteContactMessage(m.id);
                }}
                className="mt-2 text-right"
              >
                <button type="submit" className="text-red-600 hover:underline">
                  削除
                </button>
              </form>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-sm text-charcoal-soft">お問い合わせはまだありません。</p>
        )}
      </div>
    </div>
  );
}
