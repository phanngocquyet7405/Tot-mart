"use client";

import Image from "next/image";
import { MapPin, Store } from "lucide-react";

/**
 * Hero riêng cho trang chi tiết gian hàng (/brands/[slug]) — thay cho
 * HeroSectionProduct dùng chung trước đây (component đó không hề nhận
 * props, hiện y nguyên nội dung mẫu "Khám phá đồ ăn nhẹ hữu cơ cao cấp"
 * cho mọi brand). `description` là HTML từ RichTextEditor (Tiptap) nên
 * render bằng dangerouslySetInnerHTML trong khung `prose`, không in thẳng
 * chuỗi ra (sẽ hiện literal "<p>...</p>").
 */
export default function BrandDetailHero({ brand, loading }) {
  if (loading) {
    return (
      <div className="mb-8 animate-pulse rounded-lg border border-gray-100 bg-white p-8 md:p-12">
        <div className="mb-4 h-20 w-20 rounded-full bg-gray-100" />
        <div className="mb-3 h-8 w-1/2 rounded bg-gray-100" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="mb-8 rounded-lg border border-gray-100 bg-white p-8 text-center text-gray-500 md:p-12">
        Không tìm thấy gian hàng này.
      </div>
    );
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-lg border border-green-100 bg-gradient-to-br from-green-50 via-white to-yellow-50 p-8 md:p-12">
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-green-100 bg-white shadow-sm md:h-24 md:w-24">
          {brand.logo ? (
            <div className="relative h-full w-full">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            </div>
          ) : (
            <Store className="h-8 w-8 text-green-700/40" />
          )}
        </div>

        <div className="max-w-3xl">
          <div className="mb-2 inline-block rounded-full bg-green-100/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-700">
            Gian hàng đối tác
          </div>

          <h1 className="mb-2 font-serif text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {brand.name}
          </h1>

          {brand.cityAddress && (
            <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {brand.cityAddress}
            </p>
          )}

          {brand.description ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 prose-p:my-1.5 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: brand.description }}
            />
          ) : (
            <p className="text-gray-500 italic">
              Gian hàng chưa cập nhật mô tả giới thiệu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
