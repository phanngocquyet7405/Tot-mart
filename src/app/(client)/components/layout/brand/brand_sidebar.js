"use client";
import logger from "@/app/util/Logger";
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
        logger.error("Lỗi tải sidebar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-card border border-border p-5 rounded-xl">
        <h2 className="text-[16px] font-medium mb-4 text-foreground">
          Tác động xã hội
        </h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="hover:text-primary cursor-pointer transition-colors">
            Sức khỏe cộng đồng
          </li>
        </ul>
      </div>

      <div className="bg-card border border-border p-5 rounded-xl">
        <h2 className="text-[16px] font-medium mb-4 text-foreground">
          Tên gian hàng
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : (
          <ul className="space-y-3 text-sm text-muted-foreground max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            <li>
              <Link
                href="/brands"
                className={`block transition-colors ${!currentSlug ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                Tất cả gian hàng
              </Link>
            </li>
            <hr className="my-2 border-border" />
            {brands.map((brand) => (
              <li key={brand._id || brand.id}>
                <Link
                  href={`/brands/${brand.slug || brand._id}`}
                  className={`block transition-colors ${currentSlug === (brand.slug || brand._id) ? "text-primary font-bold" : "hover:text-primary"}`}
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
