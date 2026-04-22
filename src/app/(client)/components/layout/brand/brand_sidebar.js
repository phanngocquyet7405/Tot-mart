"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllBrandsApi } from "@/app/services/api/productServices";

export default function BrandSidebar({ currentSlug }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getAllBrandsApi();
        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) setBrands(data);
      } catch (error) {
        console.error("Lỗi tải sidebar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-white border border-gray-200 p-5 rounded-sm">
        <h2 className="text-[16px] font-medium mb-4 text-gray-800">
          Tác động xã hội
        </h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="hover:text-orange-600 cursor-pointer transition-colors">
            Sức khỏe cộng đồng
          </li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 p-5 rounded-sm">
        <h2 className="text-[16px] font-medium mb-4 text-gray-800">
          Tên gian hàng
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : (
          <ul className="space-y-3 text-sm text-gray-600 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            <li>
              <Link
                href="/brands"
                className={`block transition-colors ${!currentSlug ? "text-orange-600 font-bold" : "hover:text-orange-600"}`}
              >
                Tất cả gian hàng
              </Link>
            </li>
            <hr className="my-2 border-gray-100" />
            {brands.map((brand) => (
              <li key={brand._id || brand.id}>
                <Link
                  href={`/brands/${brand.slug || brand._id}`}
                  className={`block transition-colors ${currentSlug === (brand.slug || brand._id) ? "text-orange-600 font-bold" : "hover:text-orange-600"}`}
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
