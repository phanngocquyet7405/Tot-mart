// app/categories/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CategoryBaseLayout from "../components/layout/category/category_base_layout";
import { getAllCategoriesApi } from "@/app/services/api/productServices";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await getAllCategoriesApi();
        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) setCategories(data);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <CategoryBaseLayout>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Khám phá Danh mục
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lựa chọn sản phẩm theo nhu cầu của bạn
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 italic">
          Đang tìm kiếm danh mục...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat._id}`}
              className="group"
            >
              <div className="bg-white border border-gray-100 rounded-sm p-6 text-center hover:shadow-md hover:border-orange-200 transition-all h-full flex flex-col items-center">
                <div className="relative w-20 h-20 mb-4 group-hover:scale-110 transition-transform">
                  <Image
                    src={cat.image || "/icons/category-default.png"}
                    alt={cat.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </h3>
                <div className="mt-2 py-1 px-3 bg-gray-50 rounded-full">
                  <p className="text-[10px] uppercase font-semibold text-gray-400">
                    {cat.productCount || 0} sản phẩm
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CategoryBaseLayout>
  );
}
