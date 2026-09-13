import type { Product, ProductImage, ProductVariant, Brand, Category } from "@prisma/client";

export type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
};
