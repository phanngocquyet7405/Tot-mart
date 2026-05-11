"use client";

import React, { useState } from "react";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import NavMenu from "../components/ui/nav_menu";
import TotMartSupport from "../components/layout/totmart_suppport";
import SideBar from "../components/ui/SideBar";
import ProductsGrid from "../components/layout/product/products_grid";
import Footer from "../components/ui/footer";
import HeroSectionProduct from "../components/hero_section_page/hero_section_products";
import Link from "next/link";

export default function ProductPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="container mx-auto px-4 pt-8">
        <HeroSectionProduct />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-64 shrink-0">
            <SideBar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          <main className="flex-1 min-w-0 pl-15">
            <ProductsGrid />
          </main>
        </div>
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}
