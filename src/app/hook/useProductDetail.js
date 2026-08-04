"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAddToCart } from "@/app/hook/useAddToCart";
import { useWishlist } from "@/app/context/WishlistContext";
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
  const router = useRouter();
  const { addToCart } = useAddToCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(PLACEHOLDER_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const isWishlisted = product ? isInWishlist(product._id) : false;

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

  // Helper dùng chung cho cả "Thêm vào giỏ" lẫn "Mua ngay" — tránh lặp lại
  // cấu trúc item giữa 2 handler.
  const buildCartItem = useCallback(() => {
    if (!product) return null;
    const finalPrice = getFinalPrice(product);
    return {
      _id: product._id,
      id: product._id,
      name: product.name,
      image: product.images?.[0]?.url || PLACEHOLDER_IMAGE,
      price: finalPrice,
    };
  }, [product]);

  const handleAddToCart = useCallback(async () => {
    const itemToAdd = buildCartItem();
    if (!itemToAdd) return;
    try {
      setIsAddingToCart(true);
      // 1 lời gọi duy nhất với quantity — addToCart (hook dùng chung) tự lo
      // toast báo thành công và mở Cart Drawer (dùng chung ở MainHeader).
      addToCart(itemToAdd, quantity);
    } finally {
      setIsAddingToCart(false);
    }
  }, [buildCartItem, quantity, addToCart]);

  // "Mua ngay" — thêm sản phẩm vào giỏ (gộp với các sản phẩm đã có sẵn
  // trong giỏ, vì trang /checkout hiện thanh toán theo TOÀN BỘ giỏ hàng
  // chứ chưa hỗ trợ "checkout riêng 1 sản phẩm") rồi đi thẳng /checkout —
  // bỏ qua toast/mở drawer vì đang điều hướng sang trang khác ngay.
  const handleBuyNow = useCallback(() => {
    const itemToAdd = buildCartItem();
    if (!itemToAdd) return;
    setIsBuyingNow(true);
    addToCart(itemToAdd, quantity, { showToast: false, openDrawer: false });
    router.push("/checkout");
  }, [buildCartItem, quantity, addToCart, router]);

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
    if (!product) return;
    const item = {
      _id: product._id,
      id: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0]?.url || PLACEHOLDER_IMAGE,
      price: getFinalPrice(product),
    };
    const added = toggleWishlist(item);
    toast.success(
      added ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích",
    );
  }, [product, toggleWishlist]);

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
    isBuyingNow,
    selectQuantity,
    increaseQty,
    decreaseQty,
    handleAddToCart,
    handleBuyNow,
    handleShare,
    handleWishlist,
    finalPrice: getFinalPrice(product),
    fmtPrice: formatPrice,
  };
}
