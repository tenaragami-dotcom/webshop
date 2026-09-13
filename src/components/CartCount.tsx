"use client";

import { useCartStore } from "@/lib/cart-store";
import { useIsClient } from "@/lib/use-is-client";

export function CartCount() {
  const isClient = useIsClient();
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  if (!isClient || count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] text-white">
      {count}
    </span>
  );
}
