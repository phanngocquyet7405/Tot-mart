"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// UI Components
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import Footer from "@/app/(client)/components/ui/footer";

import { useProductDetail } from "@/app/hook/useProductDetail";
import { ProductGallery } from "../../components/Product/ProductGallery";
import { ProductPurchasePanel } from "../../components/Product/ProductPurchasePanel";
import { ProductInfoTabs } from "../../components/Product/ProductInfoTabs";
import { ProductLoadingState } from "../../components/Product/ProductLoadingState";
import { ProductNotFoundState } from "../../components/Product/ProductNotFoundState";
import { FrequentlyBought } from "../../components/Product/FrequentlyBought";

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slug = params?.slug || "";

  const {
    product,
    relatedProducts,
    loading,
    error, retry,
    selectedImage,
    setSelectedImage,
    quantity,
    activeTab,
    setActiveTab,
    isWishlisted,
    isAddingToCart,
    isBuyingNow,
    increaseQty,
    decreaseQty,
    handleAddToCart,
    handleBuyNow,
    handleShare,
    handleWishlist,
    finalPrice,
    fmtPrice,
  } = useProductDetail(slug);

  // Thứ tự header đúng chuẩn dùng xuyên suốt toàn site (products/page.js,
  // categories, brands, homepage...): AnnouncementBar → MainHeader → NavMenu.
  // (Riêng box/[id]/page.js hiện đang đảo NavMenu/MainHeader — lệch so với
  // phần còn lại của app, không lặp lại chỗ lệch đó ở đây.)
  if (loading) {
    return (
      <>
        <AnnouncementBar />
        <MainHeader />
        <NavMenu />
        <ProductLoadingState />
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AnnouncementBar />
        <MainHeader />
        <NavMenu />
        <ProductNotFoundState error={error} onRetry={retry} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      {/* Cart Drawer giờ dùng chung 1 instance duy nhất (mount trong
          MainHeader ở trên), điều khiển qua CartContext.isCartOpen — không
          còn mount riêng ở đây nữa để tránh 2 Drawer tồn tại song song. */}

      <main className="tm-commerce max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:py-10">
        <nav className="tm-breadcrumb" aria-label="Đường dẫn">
          <Link href="/homepage">Cửa hàng</Link><ChevronRight size={14} aria-hidden="true" />
          <Link href="/products">Sản phẩm</Link><ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <ProductGallery
            images={product.images || []}
            productName={product.name}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            discountPercent={product.salePercent || 0}
          />

          <div className="lg:col-span-5 space-y-6">
            <ProductPurchasePanel
              product={product}
              finalPrice={finalPrice}
              quantity={quantity}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
              isAddingToCart={isAddingToCart}
              onAddToCart={handleAddToCart}
              isBuyingNow={isBuyingNow}
              onBuyNow={handleBuyNow}
              isWishlisted={isWishlisted}
              onWishlist={handleWishlist}
              onShare={handleShare}
              fmtPrice={fmtPrice}
            />
          </div>
        </div>

        <ProductInfoTabs
          product={product}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-16">
          <FrequentlyBought products={relatedProducts} />
        </div>

      </main>

      <Footer />
    </>
  );
}
