"use client";
import logger from "@/app/util/Logger";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import AnnouncementBar from "../../components/ui/AnnouncementBar";
import MainHeader from "../../components/ui/main_header";
import NavMenu from "../../components/ui/nav_menu";
import TotMartSupport from "../../components/layout/totmart_suppport";
import Footer from "../../components/ui/footer";
import ProductsGrid from "../../components/layout/product/products_grid";
import SideBar from "../../components/ui/SideBar";
import { getAllCategoriesApi } from "@/app/services/api/productServices";

export default function CategoryDetailPage({ initialCategory = null }) {
  const params = useParams();
  const slugOrId = params?.id;

  const [actualId, setActualId] = useState(initialCategory?._id || null);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(!initialCategory);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setLoading(false);
      return;
    }
    const resolveCategory = async () => {
      try {
        const res = await getAllCategoriesApi();
        const data = res?.data?.data || res?.data || [];

        const foundCategory = data.find(
          (cat) => cat.slug === slugOrId || cat._id === slugOrId,
        );

        if (foundCategory) {
          setActualId(foundCategory._id);
          setCategory(foundCategory);
        } else {
          setActualId(null);
          setCategory(null);
        }
      } catch (error) {
        logger.error("Error finding category:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) {
      resolveCategory();
    }
  }, [slugOrId, initialCategory]);

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  if (!actualId)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-xs z-50">
        <AnnouncementBar />
        <MainHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          cartItemCount={0}
          cartTotal={0}
        />
        <div className="border-b border-border">
          <NavMenu />
        </div>
      </div>

      {/* Hero Banner */}
      <div
        className="relative h-64 md:h-96 bg-card border-b border-border text-foreground overflow-hidden"
        style={{
          backgroundImage: category?.image
            ? `url('${category.image}')`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="container mx-auto px-4">
            <p className="text-sm font-semibold text-primary font-semibold uppercase tracking-wider mb-3">
              Category
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {category?.name || "Category"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {category?.description ||
                "Discover our curated selection of premium organic products"}
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <SideBar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Main Products */}
          <main className="flex-1 min-w-0">
            <ProductsGrid categoryId={actualId} />
          </main>
        </div>
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}
