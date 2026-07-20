"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllCategoriesApi } from "@/app/services/api/productServices";

export default function ProductCategoriesShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategoriesApi();
        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) {
          setCategories(data.slice(0, 4)); // Get first 4 categories
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-2">
            Bộ Sưu Tập
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
            Phân loại sản phẩm
          </h2>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">Đang tải danh mục...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className="group"
              >
                <div className="relative rounded-lg overflow-hidden h-64 md:h-72 bg-gray-200 mb-4 shadow-sm hover:shadow-lg transition-all duration-300">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Category Info */}
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    {category.productCount || 0} Sản Phẩm
                  </p>
                  <h3 className="text-lg font-serif font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
