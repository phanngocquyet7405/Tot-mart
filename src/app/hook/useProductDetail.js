"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import {
  PLACEHOLDER_IMAGE,
  extractProductId,
  fetchProductDetail,
  fetchRelatedProducts,
  formatPrice,
  getFinalPrice,
} from "../(client)/components/Product/productDetailService";

/**
 * Hook trung tâm cho trang chi tiết sản phẩm — gom toàn bộ state + logic
 * nghiệp vụ, tách khỏi phần render. Theo đúng layering
 * service → hooks → components → page orchestrator đang dùng trong dự án
 * (ví dụ Checkout, admin subscription plan).
 */
export function useProductDetail(slug) {
  const productId = extractProductId(slug);
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(PLACEHOLDER_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const productData = await fetchProductDetail(productId);
        if (cancelled) return;

        if (!productData) {
          toast.error("Không thể tải thông tin sản phẩm");
          setProduct(null);
          return;
        }

        setProduct(productData);
        setSelectedImage(productData.images?.[0]?.url || PLACEHOLDER_IMAGE);
        setQuantity(1);

        const categoryId = productData.category?._id || productData.category;
        if (categoryId) {
          const related = await fetchRelatedProducts(
            categoryId,
            productData._id,
          );
          if (!cancelled) setRelatedProducts(related);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Lỗi tải sản phẩm:", err);
          toast.error("Có lỗi xảy ra khi tải sản phẩm");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const increaseQty = useCallback(() => {
    setQuantity((q) => {
      const maxStock = product?.stock ?? 99;
      return q < maxStock ? q + 1 : q;
    });
  }, [product]);

  // Dùng khi chọn bậc số lượng từ BulkDiscounts — kẹp theo tồn kho giống
  // increaseQty để không bao giờ vượt quá product.stock.
  const selectQuantity = useCallback(
    (qty) => {
      const maxStock = product?.stock ?? 99;
      setQuantity(Math.max(1, Math.min(qty, maxStock)));
    },
    [product],
  );

  const decreaseQty = useCallback(() => {
    setQuantity((q) => (q > 1 ? q - 1 : q));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      setIsAddingToCart(true);
      const finalPrice = getFinalPrice(product);
      const itemToAdd = {
        _id: product._id,
        id: product._id,
        name: product.name,
        image: product.images?.[0]?.url || PLACEHOLDER_IMAGE,
        price: finalPrice,
      };
      for (let i = 0; i < quantity; i++) {
        addToCart(itemToAdd);
      }
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng 🛒`);
      setIsCartOpen(true);
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, quantity, addToCart]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Xem sản phẩm: ${product?.name}`,
          url,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
      } catch {
        toast.error("Không thể sao chép liên kết");
      }
    }
  }, [product]);

  const handleWishlist = useCallback(() => {
    setIsWishlisted((prev) => {
      toast.success(
        prev
          ? "Đã xóa khỏi danh sách yêu thích"
          : "Đã thêm vào danh sách yêu thích",
      );
      return !prev;
    });
  }, []);

  return {
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
    selectQuantity,
    increaseQty,
    decreaseQty,
    handleAddToCart,
    handleShare,
    handleWishlist,
    finalPrice: getFinalPrice(product),
    fmtPrice: formatPrice,
  };
}
