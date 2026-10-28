"use client";
import logger from "@/app/util/Logger";
// components/layout/category/category_sidebar.jsx
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
        logger.error("Lỗi tải danh mục:", error);
      } finally {
        setCategories(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-card border border-border p-5 rounded-xl">
        <h2 className="text-[16px] font-medium mb-4 text-foreground uppercase tracking-wider">
          Danh mục sản phẩm
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground italic">Đang tải...</p>
        ) : (
          <ul className="space-y-3 text-sm text-muted-foreground max-h-125 overflow-y-auto pr-2 custom-scrollbar">
            <li>
              <Link
                href="/categories"
                className={`block transition-colors ${!currentId ? "text-primary font-bold" : "hover:text-primary"}`}
              >
                Tất cả danh mục
              </Link>
            </li>
            <hr className="my-2 border-border" />
            {categories.map((cat) => (
              <li key={cat._id || cat.id}>
                <Link
                  href={`/categories/${cat._id || cat.id}`}
                  className={`block transition-colors ${currentId === (cat._id || cat.id) ? "text-primary font-bold" : "hover:text-primary"}`}
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
