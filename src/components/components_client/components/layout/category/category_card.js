// components/layout/category/category_card.jsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ category }) {
  return (
    <Link href={`/categories/${category._id}`} className="group">
      <div className="flex flex-col items-center text-center h-full">
        {/* Circular Image Container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
          <Image
            src={category.image || "/icons/category-default.png"}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Product Count */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            {category.productCount || 0} Products
          </p>
        </div>

        {/* Category Name */}
        <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
          {category.name}
        </h3>

        {/* Decorative Underline */}
        <div className="mt-4 h-1 w-12 bg-yellow-500 rounded-full mx-auto group-hover:w-16 transition-all duration-300"></div>
      </div>
    </Link>
  );
}
