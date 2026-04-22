import React from "react";
import Image from "next/image";
import Link from "next/link";

export const BrandCard = ({ brand }) => {
  const brandSlug = brand.slug || brand._id || "gian-hang";
  const brandHref = `/brands/${brandSlug}`;

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
      {/* Phần trên: Logo và Tên */}
      <div className="p-4 bg-white flex flex-col items-center border-b border-gray-100">
        <div className="relative w-full h-32 mb-4 flex items-center justify-center">
          <Image
            src={brand.logo || "/placeholder-logo.png"} // Thay bằng field logo của bạn
            alt={brand.name || "Brand Logo"}
            fill
            className="object-contain p-2"
          />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 text-center">
          Gian hàng {brand.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {brand.productCount || 0} Sản phẩm
        </p>
      </div>

      {/* Phần dưới: Nền xám, Mô tả và Chi tiết */}
      <div className="flex flex-col grow p-4 bg-[#f4f4f4]">
        <p className="text-xs text-gray-600 line-clamp-5 leading-relaxed text-justify mb-4">
          {brand.description ||
            "Đang cập nhật thông tin giới thiệu về gian hàng này..."}
        </p>

        <div className="mt-auto">
          <Link
            href={brandHref}
            className="text-xs font-semibold text-gray-800 hover:text-orange-600 transition-colors"
          >
            Chi tiết &gt;&gt;
          </Link>
        </div>
      </div>
    </div>
  );
};
