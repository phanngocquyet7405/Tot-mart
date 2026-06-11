"use client";

import React, { useState } from "react";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import NavMenu from "../components/ui/nav_menu";
import TotMartSupport from "../components/layout/totmart_suppport";
import SideBar from "../components/ui/SideBar";
import ProductsGrid from "../components/layout/product/products_grid";
import Footer from "../components/ui/footer";

export default function ProductPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white shadow-sm z-1000">
        <AnnouncementBar />

        <MainHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          cartItemCount={0}
          cartTotal={0}
        />

        <div className="border-b border-gray-100">
          <NavMenu />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3 text-green-200">
            Premium Organic Curations
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Premium Organic Snacks
          </h1>
          <p className="text-lg text-green-100 max-w-2xl">
            Discover our curated selection of hand-picked organic snacks that
            nourish the soul and respect the planet.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <div className="w-full lg:w-64 shrink-0">
            <SideBar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Main Products */}
          <main className="flex-1 min-w-0">
            <ProductsGrid />
          </main>
        </div>
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}
