import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RentalPlanType } from "@/lib/rental-plan";

export type CartItemType = "PURCHASE" | "RENTAL";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  imageSeed: string;
  imageUrl?: string;
  variantName?: string;
  type: CartItemType;
  price: number;
  quantity: number;
  rentalStart?: string;
  rentalEnd?: string;
  planType?: RentalPlanType;
  planLabel?: string;
  extensionDays?: number;
};

export type CartLineKey = Pick<CartItem, "productId" | "type" | "rentalStart" | "variantName">;

function sameLine(a: CartItem, b: CartLineKey) {
  return (
    a.productId === b.productId &&
    a.type === b.type &&
    a.rentalStart === b.rentalStart &&
    a.variantName === b.variantName
  );
}

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (key: CartLineKey) => void;
  updateQuantity: (key: CartLineKey, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex((i) => sameLine(i, item));
          if (existingIndex >= 0 && item.type === "PURCHASE") {
            const next = [...state.items];
            next[existingIndex] = {
              ...next[existingIndex],
              quantity: next[existingIndex].quantity + item.quantity,
            };
            return { items: next };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, key)),
        })),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, key) ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "bridal-shop-cart" }
  )
);
