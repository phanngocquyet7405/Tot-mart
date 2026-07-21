"use client";

import { use } from "react";
import { ChevronRight } from "lucide-react";

// UI Components
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import Footer from "@/app/(client)/components/ui/footer";
import CartDrawer from "@/app/(client)/components/Cart_component/cart_drawer";

import { useProductDetail } from "@/app/hook/useProductDetail";
import { ProductGallery } from "../../components/Product/ProductGallery";
import { ProductPurchasePanel } from "../../components/Product/ProductPurchasePanel";
import { ProductInfoTabs } from "../../components/Product/ProductInfoTabs";
import { RelatedProducts } from "../../components/Product/RelatedProducts";
import { ProductLoadingState } from "../../components/Product/ProductLoadingState";
import { ProductNotFoundState } from "../../components/Product/ProductNotFoundState";

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slug = params?.slug || "";

  const {
    product,
    relatedProducts,
    loading,
    selectedImage,
    setSelectedImage,
    quantity,
    activeTab,
    setActiveTab,
    isWishlisted,
    isAddingToCart,
    isCartOpen,
    setIsCartOpen,
    increaseQty,
    decreaseQty,
    handleAddToCart,
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
        <ProductNotFoundState />
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      {/* Drawer giỏ hàng — luôn mount để AnimatePresence xử lý animation
          đóng/mở đúng cách; prop đúng tên thật của CartDrawer là open/setOpen
          (bản trước đây truyền nhầm isOpen/setIsOpen nên không hoạt động). */}
      <CartDrawer open={isCartOpen} setOpen={setIsCartOpen} />

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-8 uppercase tracking-widest font-semibold">
          <span>Cửa hàng</span>
          <ChevronRight size={12} />
          <span>Sản phẩm</span>
          <ChevronRight size={12} />
          <span className="text-stone-800 truncate max-w-xs">
            {product.name}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <ProductGallery
            images={product.images || []}
            productName={product.name}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            discountPercent={product.discount || 0}
          />

          <ProductPurchasePanel
            product={product}
            finalPrice={finalPrice}
            quantity={quantity}
            onIncrease={increaseQty}
            onDecrease={decreaseQty}
            isAddingToCart={isAddingToCart}
            onAddToCart={handleAddToCart}
            isWishlisted={isWishlisted}
            onWishlist={handleWishlist}
            onShare={handleShare}
            fmtPrice={fmtPrice}
          />
        </div>

        <ProductInfoTabs
          product={product}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <RelatedProducts products={relatedProducts} fmtPrice={fmtPrice} />
      </div>

      <Footer />
    </>
  );
}
