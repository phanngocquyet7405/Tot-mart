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
      <h2 className="text-xl md:text-2xl font-black text-stone-900 mb-8 uppercase tracking-wide">
        Sản phẩm liên quan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const finalPrice = getFinalPrice(p);
          return (
            <div
              key={p._id}
              onClick={() => router.push(buildProductHref(p))}
              className="border border-stone-100 hover:border-amber-200 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-[#faf8f4]">
                <Image
                  src={p.images?.[0]?.url || PLACEHOLDER_IMAGE}
                  alt={p.name}
                  fill
                  className="object-cover p-2 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                {p.discount > 0 && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-[10px] font-black">
                    -{p.discount}%
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-stone-800 text-sm line-clamp-2 group-hover:text-amber-800 transition-colors">
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-red-600">
                    {fmtPrice(finalPrice)}
                  </span>
                  {p.discount > 0 && (
                    <span className="text-xs text-stone-400 line-through">
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
