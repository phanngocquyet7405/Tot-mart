// app/brands/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import BrandBaseLayout from "../components/layout/brand/BrandBaseLayout";
import { BrandCard } from "../components/layout/brand/brand_card";
import { getAllBrandsApi } from "@/app/services/api/productServices"; //

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getAllBrandsApi(); //[cite: 11]
        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) setBrands(data);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <BrandBaseLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tất cả gian hàng</h1>
        <span className="text-sm text-gray-500">
          {brands.length} thương hiệu
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 italic">
          Đang tải gian hàng...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand._id || brand.id} brand={brand} /> //[cite: 12]
          ))}
        </div>
      )}
    </BrandBaseLayout>
  );
}
