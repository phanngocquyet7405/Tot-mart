// components/layout/category/category_base_layout.jsx
"use client";

import React, { useState } from "react";
import AnnouncementBar from "../../ui/AnnouncementBar";
import MainHeader from "../../ui/main_header";
import NavMenu from "../../ui/nav_menu";
import TotMartSupport from "../totmart_suppport";
import Footer from "../../ui/footer";
import CategorySidebar from "./category_sidebar";
import HeroSectionProduct from "../../hero_section_page/hero_section_products";

export default function CategoryBaseLayout({ children, categoryId }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tái cấu trúc Header giống ProductPage */}
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
        <HeroSectionProduct type="category" id={categoryId} />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <CategorySidebar currentId={categoryId} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <TotMartSupport />
      <Footer />
    </div>
  );
}
