// app/brands/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import NavMenu from "../components/ui/nav_menu";
import TotMartSupport from "../components/layout/totmart_suppport";
import Footer from "../components/ui/footer";
import { getAllBrandsApi } from "@/app/services/api/productServices";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getAllBrandsApi();
        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) setBrands(data);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Get featured brands (first 3) and rest
  const featuredBrands = brands.slice(0, 3);
  const otherBrands = brands.slice(3);

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
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3 text-green-200">
            Curated Excellence
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Featured Organic Purveyors
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Filter Section and Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              Brand Name
            </h2>
            <p className="text-gray-600 text-sm">
              Filter by brand characteristics and values
            </p>
          </div>

          {/* Sidebar Filter (left side on desktop) */}
          <div className="w-full md:w-48 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Social Impact
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <input type="checkbox" id="zero-waste" className="w-4 h-4" />
                  <label htmlFor="zero-waste" className="text-gray-700">
                    Zero Waste Certified
                  </label>
                </li>
                <li className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="carbon-neutral"
                    className="w-4 h-4"
                  />
                  <label htmlFor="carbon-neutral" className="text-gray-700">
                    Carbon Neutral Shipping
                  </label>
                </li>
                <li className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fair-trade"
                    className="w-4 h-4"
                  />
                  <label htmlFor="fair-trade" className="text-gray-700">
                    Fair Trade Partners
                  </label>
                </li>
                <li className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="regenerative"
                    className="w-4 h-4"
                  />
                  <label htmlFor="regenerative" className="text-gray-700">
                    Regenerative Agriculture
                  </label>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 italic">
            Loading brands...
          </div>
        ) : (
          <>
            {/* Featured Bento Grid */}
            {featuredBrands.length > 0 && (
              <div className="mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
                  {featuredBrands.map((brand, index) => (
                    <Link
                      key={brand._id}
                      href={`/brands/${brand.slug || brand._id}`}
                      className={`group relative overflow-hidden rounded-lg ${
                        index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                      } bg-gray-900 hover:shadow-2xl transition-all duration-300`}
                    >
                      {/* Background Image */}
                      {brand.image && (
                        <Image
                          src={brand.image}
                          alt={brand.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                          {brand.name}
                        </h3>
                        <p className="text-sm opacity-90">
                          {brand.tagline ||
                            "Premium organic goods"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Directory Grid */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
                Our Brand Partners
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherBrands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/brands/${brand.slug || brand._id}`}
                    className="group"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-green-200 h-full flex flex-col">
                      {/* Logo */}
                      {brand.logo && (
                        <div className="relative h-20 mb-4 flex items-center justify-center">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}

                      {/* Brand Info */}
                      <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                        {brand.description ||
                          "Premium organic and artisanal goods for the discerning pantry."}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <span>{brand.productCount || 0} Products</span>
                        <span className="text-green-600 font-semibold group-hover:text-green-700">
                          View →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-12">
              <button className="px-8 py-3 border-2 border-gray-800 text-gray-800 font-semibold rounded-full hover:bg-gray-800 hover:text-white transition-colors duration-300">
                View All Partners
              </button>
            </div>
          </>
        )}
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}
