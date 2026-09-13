import Link from "next/link";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { BrandName } from "@/components/BrandName";
import { formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const mainImage = product.images[0];
  const totalStock =
    product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
      : product.stockQuantity;
  const soldOut = product.isSellable && totalStock <= 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-blush">
        {mainImage && (
          <PlaceholderImage
            seed={mainImage.seed}
            url={mainImage.url}
            label={product.brand.name}
            width={480}
            height={600}
            className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 bg-charcoal px-2 py-1 text-[10px] tracking-wide-jp text-white">
            SOLD OUT
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex gap-1.5 text-[10px] tracking-wide-jp">
          {product.isSellable &&
            (soldOut ? (
              <span className="border border-charcoal-soft px-1.5 py-0.5 text-charcoal-soft">
                SOLD OUT
              </span>
            ) : (
              <span className="border border-gold px-1.5 py-0.5 text-gold">SELL</span>
            ))}
          {product.isRentable && (
            <span className="border border-blush-dark px-1.5 py-0.5 text-blush-dark">
              RENTAL
            </span>
          )}
        </div>
        <p className="text-[11px] text-charcoal-soft">
          <BrandName name={product.brand.name} reading={product.brand.reading} />
        </p>
        <p className="text-sm">{product.name}</p>
        <div className="text-sm">
          {product.isSellable && product.priceSell !== null && (
            <p>{formatPrice(product.priceSell)}</p>
          )}
          {product.isRentable && product.priceRental !== null && (
            <p className="text-blush-dark">
              レンタル {formatPrice(product.priceRental)}〜
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
