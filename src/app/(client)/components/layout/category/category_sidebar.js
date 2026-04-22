// components/layout/category/category_sidebar.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllCategoriesApi } from "@/app/services/api/productServices"; //

export default function CategorySidebar({ currentId }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategoriesApi(); //[cite: 11]
        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) setCategories(data);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setCategories(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-white border border-gray-200 p-5 rounded-sm">
        <h2 className="text-[16px] font-medium mb-4 text-gray-800 uppercase tracking-wider">
          Danh mục sản phẩm
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500 italic">Đang tải...</p>
        ) : (
          <ul className="space-y-3 text-sm text-gray-600 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
            <li>
              <Link
                href="/categories"
                className={`block transition-colors ${!currentId ? "text-orange-600 font-bold" : "hover:text-orange-600"}`}
              >
                Tất cả danh mục
              </Link>
            </li>
            <hr className="my-2 border-gray-100" />
            {categories.map((cat) => (
              <li key={cat._id || cat.id}>
                <Link
                  href={`/categories/${cat._id || cat.id}`}
                  className={`block transition-colors ${currentId === (cat._id || cat.id) ? "text-orange-600 font-bold" : "hover:text-orange-600"}`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
