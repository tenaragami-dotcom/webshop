"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { cancelOrder } from "@/app/account/actions";

export function CancelOrderButton({ orderId, fee }: { orderId: string; fee: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[11px] text-charcoal-soft underline hover:text-red-600"
      >
        キャンセルする
      </button>
    );
  }

  return (
    <div className="mt-2 border border-line bg-blush/40 p-3 text-[11px] text-charcoal-soft">
      <p>
        キャンセル料 <span className="text-sm text-charcoal">{formatPrice(fee)}</span>{" "}
        が発生します。よろしいですか？
      </p>
      {error && <p className="mt-1 text-red-600">{error}</p>}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            setError(null);
            try {
              await cancelOrder(orderId);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "キャンセルに失敗しました。");
              setSubmitting(false);
            }
          }}
          className="border border-charcoal bg-charcoal px-3 py-1.5 text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {submitting ? "処理中..." : "この内容でキャンセルする"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={submitting}
          className="underline"
        >
          やめる
        </button>
      </div>
    </div>
  );
}
