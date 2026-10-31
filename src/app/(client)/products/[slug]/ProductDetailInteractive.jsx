"use client";

import { useCart } from "@/app/context/CartContext";
import { useProductDetail } from "@/app/hook/useProductDetail";
import { ProductGallery } from "../../components/Product/ProductGallery";
import { ProductPurchasePanel } from "../../components/Product/ProductPurchasePanel";
import { ProductInfoTabs } from "../../components/Product/ProductInfoTabs";
import { FrequentlyBought } from "../../components/Product/FrequentlyBought";
import { ProductLoadingState } from "../../components/Product/ProductLoadingState";
import { ProductNotFoundState } from "../../components/Product/ProductNotFoundState";

export default function ProductDetailInteractive({ initialProduct, slug }) {
  const { isMounted: isCartMounted } = useCart();
  const {
    product,
    loading,
    error,
    retry,
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
    relatedProducts,
  } = useProductDetail(slug, initialProduct);

  if (loading && !product) {
    return <ProductLoadingState />;
  }

  if (!product) {
    return <ProductNotFoundState error={error} onRetry={retry} />;
  }

  return (
    <>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <ProductGallery
          images={product.images || []}
          productName={product.name}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
          discountPercent={product.salePercent || 0}
        />

        <ProductPurchasePanel
          product={product}
          quantity={quantity}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onShare={handleShare}
          onWishlist={handleWishlist}
          isWishlisted={isWishlisted}
          isAddingToCart={isAddingToCart}
          isBuyingNow={isBuyingNow}
          finalPrice={finalPrice}
          fmtPrice={fmtPrice}
          isReady={Boolean(isCartMounted)}
        />
      </div>

      <ProductInfoTabs
        product={product}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <FrequentlyBought products={relatedProducts} currentProductId={product._id} />
    </>
  );
}
