// app/categories/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import NavMenu from "../components/ui/nav_menu";
import TotMartSupport from "../components/layout/totmart_suppport";
import Footer from "../components/ui/footer";
import CategoryCard from "../components/layout/category/category_card";
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-1000">
        <AnnouncementBar />
        <MainHeader onMenuClick={() => {}} cartItemCount={0} cartTotal={0} />
        <div className="border-b border-gray-200">
          <NavMenu />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-3">
              Browse Our Collections
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Discover Our Curation
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Explore the finest organic selections, from premium heritage nuts to sustainably sourced gifts. Meticulously curated for the conscious epicurean.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        {loading ? (
          <div className="py-20 text-center text-gray-400 italic">
            Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
            {categories.map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        )}
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}
