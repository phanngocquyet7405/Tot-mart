"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation, HEADER_H } from "@/components_box/nav_box";
import TotMartSupport from "../components/layout/totmart_suppport";
import SideBar from "../components/ui/SideBar";
import ProductsGrid from "../components/layout/product/products_grid";
import Footer from "../components/ui/footer";

function ProductPageContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  return (
    <div className="page-canvas min-h-screen">
      {/* Header thống nhất TotMart Craft & Gift */}
      <AnnouncementBarBox />
      <Navigation />

      <div style={{ paddingTop: HEADER_H }}>
        {/* Hero Section */}
        <div className="bg-card border-b border-border py-12 md:py-16 relative overflow-hidden text-foreground">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3 text-primary font-semibold">
              {searchQuery ? "Kết quả tìm kiếm" : "Tuyển chọn hữu cơ & thủ công"}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {searchQuery ? `"${searchQuery}"` : "Sản phẩm TotMart"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {searchQuery
                ? "Đây là các sản phẩm phù hợp với từ khoá bạn tìm kiếm."
                : "Khám phá bộ sưu tập sản phẩm hữu cơ, thủ công được tuyển chọn kỹ lưỡng từ các nghệ nhân và hợp tác xã trên toàn quốc."}
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
              <ProductsGrid searchQuery={searchQuery} />
            </main>
          </div>
        </div>

        <TotMartSupport />
        <Footer />
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductPageContent />
    </Suspense>
  );
}
