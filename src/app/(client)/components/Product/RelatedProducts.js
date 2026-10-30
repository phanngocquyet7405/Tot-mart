"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PLACEHOLDER_IMAGE,
  buildProductHref,
  getFinalPrice,
} from "./productDetailService";

export function RelatedProducts({ products = [], fmtPrice }) {
  const router = useRouter();

  if (products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-8">
        Sản phẩm liên quan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const finalPrice = getFinalPrice(p);
          return (
            <div
              key={p._id}
              onClick={() => router.push(buildProductHref(p))}
              className="border border-border hover:border-primary/40 bg-card rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-muted/40">
                <Image
                  src={p.images?.[0]?.url || PLACEHOLDER_IMAGE}
                  alt={p.name}
                  fill
                  className="object-cover p-2 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                {p.salePercent > 0 && (
                  <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-[11px] font-bold">
                    -{p.salePercent}%
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-primary">
                    {fmtPrice(finalPrice)}
                  </span>
                  {p.salePercent > 0 && (
                    <span className="text-xs text-muted-foreground line-through">
                      {fmtPrice(p.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
