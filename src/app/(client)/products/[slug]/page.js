"use client";
import React, { useState, useEffect, useRef, use, useCallback } from "react";
import Image from "next/image";
import {
  Star,
  Heart,
  Truck,
  ShieldCheck,
  Plus,
  Check,
  Minus,
  Share2,
  ShoppingCart,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  ThumbsUp,
  Award,
  RefreshCw,
  Zap,
  Package,
  RotateCcw,
  BadgeCheck,
  Copy,
  MessageSquarePlus,
  Send,
  Flame,
  Clock,
  MapPin,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MainHeader from "../../components/ui/main_header";
import NavMenu from "../../components/ui/nav_menu";
import AnnouncementBar from "../../components/ui/AnnouncementBar";
import Footer from "../../components/ui/footer";

import {
  getProductByIdApi,
  getProductsByCategoryApi,
} from "@/app/services/api/productServices";
import { useCart } from "@/app/context/CartContext";

// ─────────────────────────────────────────────
// Toast Component
// ─────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-6 right-6 z-9999 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-slide-in-right
            ${t.type === "success" ? "bg-[#1e3040] text-white border-[#1e3040]" : ""}
            ${t.type === "wishlist" ? "bg-rose-50 text-rose-700 border-rose-200" : ""}
            ${t.type === "info" ? "bg-white text-gray-800 border-gray-200" : ""}`}
        >
          {t.icon && <span className="shrink-0 text-current">{t.icon}</span>}
          <span>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// useToast Hook
// ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ message, type = "success", icon, duration = 2800 }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, icon }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        duration,
      );
    },
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─────────────────────────────────────────────
// Image Zoom Modal
// ─────────────────────────────────────────────
function ImageZoomModal({ images, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-9998 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2"
      >
        <X className="w-6 h-6" />
      </button>

      {images?.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c - 1 + images.length) % images.length);
            }}
            className="absolute left-6 text-white/70 hover:text-white bg-white/10 rounded-full p-3 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c + 1) % images.length);
            }}
            className="absolute right-6 text-white/70 hover:text-white bg-white/10 rounded-full p-3 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div
        className="relative w-[90vw] max-w-3xl aspect-square"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images?.[current]?.url || "/placeholder.svg"}
          alt="zoom"
          fill
          className="object-contain"
          priority
        />
      </div>

      {images?.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white scale-125" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Star Rating Component
// ─────────────────────────────────────────────
function StarRating({
  rating,
  size = "w-4 h-4",
  interactive = false,
  onChange,
}) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? rating;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} transition-all ${
            star <= display
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200 fill-gray-200"
          } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(null)}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Mock Reviews Data
// ─────────────────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Nguyễn Thị Lan",
    avatar: "N",
    rating: 5,
    date: "15/04/2025",
    title: "Sản phẩm tuyệt vời!",
    content:
      "Mình đã mua nhiều lần rồi, chất lượng luôn ổn định. Đóng gói cẩn thận, giao hàng nhanh. Sẽ tiếp tục ủng hộ shop.",
    helpful: 12,
    verified: true,
  },
  {
    id: 2,
    author: "Trần Minh Đức",
    avatar: "T",
    rating: 4,
    date: "02/04/2025",
    title: "Khá ổn, giá hợp lý",
    content:
      "Sản phẩm đúng mô tả, vị ngon. Chỉ tiếc là giao hàng hơi chậm một chút so với dự kiến. Tổng thể mình hài lòng.",
    helpful: 8,
    verified: true,
  },
  {
    id: 3,
    author: "Phạm Hương",
    avatar: "P",
    rating: 5,
    date: "28/03/2025",
    title: "Mua cho cả nhà, ai cũng thích",
    content:
      "Mua về cả nhà đều thích. Con nhỏ ăn rất ngon miệng. Shop phục vụ nhiệt tình, có hỏi thì trả lời nhanh.",
    helpful: 15,
    verified: false,
  },
];

// ─────────────────────────────────────────────
// Reviews Section
// ─────────────────────────────────────────────
function ReviewsSection() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    content: "",
    author: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [helpedIds, setHelpedIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const avgRating = (
    reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
  ).toFixed(1);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: Math.round(
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
    ),
  }));

  const handleSubmit = () => {
    if (!newReview.rating || !newReview.content || !newReview.author) return;
    const review = {
      id: Date.now(),
      author: newReview.author,
      avatar: newReview.author[0]?.toUpperCase() || "U",
      rating: newReview.rating,
      date: new Date().toLocaleDateString("vi-VN"),
      title: newReview.title || "Nhận xét của tôi",
      content: newReview.content,
      helpful: 0,
      verified: false,
    };
    setReviews((prev) => [review, ...prev]);
    setNewReview({ rating: 0, title: "", content: "", author: "" });
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const toggleHelpful = (id) => {
    if (helpedIds.includes(id)) return;
    setHelpedIds((prev) => [...prev, id]);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)),
    );
  };

  return (
    <div className="py-10">
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-10 mb-10 p-8 bg-gray-50 rounded-2xl">
        <div className="flex flex-col items-center justify-center min-w-120px">
          <span className="text-6xl font-black text-[#1e3040]">
            {avgRating}
          </span>
          <StarRating
            rating={Math.round(parseFloat(avgRating))}
            size="w-5 h-5"
          />
          <span className="text-xs text-gray-500 mt-2">
            {reviews.length} đánh giá
          </span>
        </div>

        <div className="flex-1 space-y-2">
          {distribution.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-4 text-gray-600 font-medium">{star}</span>
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-gray-500 text-xs">{count}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-center gap-3">
          {submitted && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Check className="w-4 h-4" /> Cảm ơn bạn đã đánh giá!
            </div>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-[#1e3040] hover:bg-[#4a7c44] text-white text-xs font-bold uppercase tracking-widest rounded-xl px-6 py-3 transition-colors duration-300"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {showForm ? "Hủy" : "Viết đánh giá"}
          </button>
        </div>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-2xl bg-white space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="font-bold text-[#1e3040] text-sm uppercase tracking-widest flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4" /> Đánh giá của bạn
          </h4>
          <div>
            <p className="text-xs text-gray-500 mb-2">Chọn số sao *</p>
            <StarRating
              rating={newReview.rating}
              size="w-7 h-7"
              interactive
              onChange={(r) => setNewReview((p) => ({ ...p, rating: r }))}
            />
          </div>
          <input
            placeholder="Họ tên *"
            value={newReview.author}
            onChange={(e) =>
              setNewReview((p) => ({ ...p, author: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3040]/20 focus:border-[#1e3040] transition-all"
          />
          <input
            placeholder="Tiêu đề (tuỳ chọn)"
            value={newReview.title}
            onChange={(e) =>
              setNewReview((p) => ({ ...p, title: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3040]/20 focus:border-[#1e3040] transition-all"
          />
          <textarea
            placeholder="Chia sẻ trải nghiệm của bạn... *"
            value={newReview.content}
            onChange={(e) =>
              setNewReview((p) => ({ ...p, content: e.target.value }))
            }
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3040]/20 focus:border-[#1e3040] resize-none transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={
              !newReview.rating || !newReview.content || !newReview.author
            }
            className="flex items-center gap-2 bg-[#1e3040] hover:bg-[#4a7c44] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl disabled:opacity-40 transition-colors duration-300"
          >
            <Send className="w-3.5 h-3.5" /> Gửi đánh giá
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-5">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-6 border border-gray-100 rounded-2xl bg-white hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1e3040] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {review.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1e3040]">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wide bg-green-50 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Đã mua
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {review.date}
                  </span>
                </div>
                <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                {review.title && (
                  <p className="font-semibold text-sm text-gray-800 mt-2">
                    {review.title}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {review.content}
                </p>
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
                    helpedIds.includes(review.id)
                      ? "text-[#1e3040] font-bold"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Hữu ích ({review.helpful}
                  )
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Related Product Card
// ─────────────────────────────────────────────
function RelatedProductCard({ product, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAddToCart(product);
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
        <Image
          src={product.images?.[0]?.url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <button
          onClick={handleAdd}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-[#1e3040] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 hover:bg-[#1e3040] hover:text-white"
        >
          {isAdding ? (
            <>
              <Check className="w-3 h-3" /> Đã thêm!
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3" /> Thêm vào giỏ
            </>
          )}
        </button>
      </div>
      <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-0.5">
        {product.category?.name || "Product"}
      </p>
      <h4 className="text-sm font-bold text-[#1e3040] line-clamp-1 group-hover:text-[#4a7c44] transition-colors">
        {product.name}
      </h4>
      <p className="text-sm font-bold text-black mt-0.5">
        {product.price?.toLocaleString()}đ
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: Truck, label: "Giao hàng nhanh" },
  { icon: ShieldCheck, label: "Thanh toán an toàn" },
  { icon: RotateCcw, label: "Đổi trả 7 ngày" },
  { icon: Award, label: "100% Chính hãng" },
];

const SHIPPING_INFO = [
  {
    icon: Truck,
    title: "Giao hàng tiêu chuẩn",
    desc: "Miễn phí cho đơn hàng trên 500.000đ. Thời gian 2–4 ngày.",
  },
  {
    icon: Zap,
    title: "Giao hàng nhanh",
    desc: "Giao trong ngày tại nội thành. Phí 30.000đ.",
  },
  {
    icon: RefreshCw,
    title: "Đổi trả dễ dàng",
    desc: "Hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm lỗi.",
  },
  {
    icon: ShieldCheck,
    title: "Đảm bảo chất lượng",
    desc: "Hoàn tiền 100% nếu sản phẩm không đúng mô tả.",
  },
];

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slug = params?.slug || "";
  const productId = slug.includes("-") ? slug.split("-").pop() : slug;

  const { addToCart } = useCart();
  const { toasts, addToast, removeToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false); // ✅ State mới
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  const imageContainerRef = useRef(null);
  const mainAddToCartRef = useRef(null);

  // ✅ useEffect 1: Fetch sản phẩm chính
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await getProductByIdApi(productId);
        const data = res?.data || res;
        if (data) {
          setProduct(data);
          const wishlist = JSON.parse(
            localStorage.getItem("totmart_wishlist") || "[]",
          );
          setIsWishlisted(wishlist.includes(data._id || data.id));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ✅ useEffect 2: Fetch sản phẩm liên quan từ API theo danh mục
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      const categoryId = product.category?._id || product.category?.id;
      if (!categoryId) return;

      try {
        setRelatedLoading(true);
        const res = await getProductsByCategoryApi(categoryId);
        const data = res?.data || res;

        const currentId = product._id || product.id;
        const items = Array.isArray(data)
          ? data.filter((p) => (p._id || p.id) !== currentId).slice(0, 4)
          : [];

        setRelatedProducts(items);
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [product]); // ✅ Chỉ chạy khi product thay đổi, KHÔNG có mock useEffect nào khác

  // ── Sticky scroll listener ──
  useEffect(() => {
    const handleScroll = () => {
      if (mainAddToCartRef.current) {
        const rect = mainAddToCartRef.current.getBoundingClientRect();
        setShowStickyBar(rect.top < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Image Zoom ──
  const handleMouseMove = useCallback((e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ display: "block", backgroundPosition: `${x}% ${y}%` });
  }, []);

  const handleMouseLeave = useCallback(
    () => setZoomStyle({ display: "none" }),
    [],
  );

  // ── Add to Cart ──
  const handleAddToCartWithQty = useCallback(() => {
    if (!product) return;
    setAddingToCart(true);
    for (let i = 0; i < quantity; i++) addToCart(product);
    addToast({
      message: `${quantity} × "${product.name}" đã vào giỏ hàng`,
      type: "success",
      icon: <ShoppingCart className="w-4 h-4" />,
    });
    setTimeout(() => setAddingToCart(false), 1500);
  }, [product, quantity, addToCart, addToast]);

  // ── Wishlist ──
  const toggleWishlist = useCallback(() => {
    if (!product) return;
    const id = product._id || product.id;
    const wishlist = JSON.parse(
      localStorage.getItem("totmart_wishlist") || "[]",
    );
    if (isWishlisted) {
      localStorage.setItem(
        "totmart_wishlist",
        JSON.stringify(wishlist.filter((i) => i !== id)),
      );
      setIsWishlisted(false);
      addToast({
        message: "Đã bỏ khỏi yêu thích",
        type: "info",
        icon: <Heart className="w-4 h-4" />,
      });
    } else {
      wishlist.push(id);
      localStorage.setItem("totmart_wishlist", JSON.stringify(wishlist));
      setIsWishlisted(true);
      addToast({
        message: "Đã thêm vào yêu thích!",
        type: "wishlist",
        icon: <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />,
      });
    }
  }, [product, isWishlisted, addToast]);

  // ── Share ──
  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        message: "Đã sao chép link!",
        type: "info",
        icon: <Copy className="w-4 h-4" />,
      });
    }
  }, [product, addToast]);

  const updateQuantity = (val) =>
    setQuantity((prev) => Math.max(1, prev + val));

  // ─────────────── LOADING / NOT FOUND ───────────────
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-[#1e3040] border-gray-100 rounded-full animate-spin" />
          <p className="font-bold tracking-widest text-xs uppercase text-gray-400">
            Loading Totmart...
          </p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Package className="w-10 h-10 text-gray-300" />
          <p className="font-medium">Sản phẩm không tồn tại.</p>
        </div>
      </div>
    );

  const displayPrice = product.price?.toLocaleString() || "0";
  const displayOriginalPrice = product.originalPrice?.toLocaleString();
  const discountPct =
    product.originalPrice && product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;
  const currentImageUrl =
    product.images?.[selectedImage]?.url || "/placeholder.svg";

  // ─────────────── RENDER ───────────────
  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(110%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
        }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      {zoomOpen && (
        <ImageZoomModal
          images={product.images}
          initialIndex={selectedImage}
          onClose={() => setZoomOpen(false)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-100">
        <AnnouncementBar />
        <MainHeader />
        <NavMenu />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-8 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          Home
          <ChevronRight className="w-3 h-3" />
          {product.category?.name || "Collections"}
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-bold">{product.name}</span>
        </nav>

        {/* ══════════════ PRODUCT GRID ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* LEFT: Images */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 w-full md:w-20 overflow-x-auto md:overflow-visible">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 aspect-square w-16 md:w-full border-2 rounded-lg transition-all overflow-hidden ${
                    selectedImage === i
                      ? "border-[#1e3040] ring-2 ring-[#1e3040]/20"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img.url || "/placeholder.svg"}
                    alt={`thumb-${i}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>

            {/* Main Image + Zoom */}
            <div
              ref={imageContainerRef}
              className="flex-1 relative aspect-square bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden group cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={currentImageUrl}
                alt={product.name}
                fill
                className="object-cover pointer-events-none"
                priority
              />

              {/* Zoom overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  display: zoomStyle.display,
                  backgroundImage: `url(${currentImageUrl})`,
                  backgroundSize: "260%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: zoomStyle.backgroundPosition,
                }}
              />

              {/* Discount badge */}
              {discountPct && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Flame className="w-3 h-3" /> -{discountPct}%
                </div>
              )}

              {/* Action icons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={toggleWishlist}
                  className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setZoomOpen(true)}
                  className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
                  aria-label="Zoom full"
                >
                  <ZoomIn className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Zoom hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/85 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium tracking-wide whitespace-nowrap pointer-events-none shadow-sm">
                <ZoomIn className="w-3 h-3" /> Di chuột để zoom · Click để phóng
                to
              </div>
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-red-50 text-red-600 border-red-100 font-bold tracking-widest text-[10px] flex items-center gap-1">
                <Flame className="w-3 h-3" /> BESTSELLER
              </Badge>
              {product.stock > 0 && product.stock < 10 && (
                <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[10px] flex items-center gap-1">
                  <Package className="w-3 h-3" /> Còn {product.stock} sản phẩm
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-serif text-[#1e3040] mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2 mb-5 w-fit">
              <StarRating
                rating={Math.round(product.rating || 4.5)}
                size="w-4 h-4"
              />
              <span className="text-[11px] font-bold text-gray-500 underline uppercase tracking-tighter">
                {MOCK_REVIEWS.length} đánh giá
              </span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-5 p-4 bg-gray-50 rounded-xl">
              <span className="text-3xl font-black text-[#1e3040]">
                {displayPrice}đ
              </span>
              {displayOriginalPrice && (
                <span className="text-lg text-gray-400 line-through font-light">
                  {displayOriginalPrice}đ
                </span>
              )}
              {discountPct && (
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Flame className="w-3 h-3" /> -{discountPct}%
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">
                {product.description}
              </p>
            )}

            <Separator className="mb-5" />

            {/* Quantity + Add to Cart */}
            <div className="space-y-3 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Số lượng
              </p>
              <div className="flex gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1}
                    className="px-4 py-3 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center font-black text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  ref={mainAddToCartRef}
                  onClick={handleAddToCartWithQty}
                  disabled={addingToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 ${
                    addingToCart
                      ? "bg-[#4a7c44] text-white scale-[0.98]"
                      : "bg-[#1e3040] hover:bg-[#4a7c44] text-white hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <Check className="w-4 h-4" /> Đã thêm!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={toggleWishlist}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  isWishlisted
                    ? "border-rose-300 bg-rose-50 text-rose-600"
                    : "border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 text-gray-500"
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-all ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`}
                />
                {isWishlisted ? "Đã yêu thích" : "Thêm vào yêu thích"}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-[11px] font-bold text-gray-600 uppercase tracking-tight"
                >
                  <Icon className="w-4 h-4 text-green-600 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ TABS ══════════════ */}
        <div className="max-w-4xl mx-auto mb-20">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 gap-8">
              {[
                { value: "details", label: "Chi tiết" },
                { value: "shipping", label: "Giao hàng & Đổi trả" },
                {
                  value: "reviews",
                  label: `Đánh giá (${MOCK_REVIEWS.length})`,
                },
              ].map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3040] data-[state=active]:bg-transparent font-bold uppercase text-[11px] tracking-widest p-0 h-full"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent
              value="details"
              className="py-8 animate-in fade-in duration-500"
            >
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <p className="mb-6 text-base">
                  {product.description || "Không có mô tả cho sản phẩm này."}
                </p>
                <div className="mt-4 text-sm font-medium border-l-4 border-[#1e3040] pl-4 py-2 bg-gray-50 rounded-r-xl flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#1e3040] shrink-0" />
                  <div>
                    <span className="text-gray-400 uppercase text-[10px] block mb-0.5">
                      Danh mục / Thương hiệu
                    </span>
                    <span className="text-[#1e3040] font-bold">
                      {product.category?.name}
                    </span>
                    {" · "}
                    <span className="text-[#1e3040] font-bold">
                      {product.brand?.name}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="py-8 space-y-4">
              {SHIPPING_INFO.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1e3040]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#1e3040]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1e3040] text-sm">{title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent
              value="reviews"
              className="animate-in fade-in duration-500"
            >
              <ReviewsSection />
            </TabsContent>
          </Tabs>
        </div>

        {/* ══════════════ RELATED PRODUCTS ══════════════ */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-[#1e3040] flex items-center gap-2">
              <Package className="w-6 h-6" />
              Sản phẩm liên quan
            </h2>
            <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1e3040] transition-colors border-b border-current pb-0.5 flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Skeleton loading */}
          {relatedLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!relatedLoading && relatedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="w-10 h-10 mb-3 text-gray-200" />
              <p className="text-sm font-medium">
                Không có sản phẩm liên quan.
              </p>
            </div>
          )}

          {/* Products grid */}
          {!relatedLoading && relatedProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <RelatedProductCard
                  key={rp._id || rp.id}
                  product={rp}
                  onAddToCart={(p) => {
                    addToCart(p);
                    addToast({
                      message: `Đã thêm "${p.name}" vào giỏ`,
                      type: "success",
                      icon: <ShoppingCart className="w-4 h-4" />,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ══════════════ STICKY BAR ══════════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] z-110 transition-all duration-500 ease-in-out transform ${
          showStickyBar
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-lg border overflow-hidden shrink-0">
              <Image
                src={product.images?.[0]?.url || "/placeholder.svg"}
                alt="sticky"
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-[#1e3040] uppercase truncate">
                {product.name}
              </h4>
              <p className="text-[12px] font-black text-[#1e3040]">
                {displayPrice}đ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleWishlist}
              className="p-2 border border-gray-200 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
              />
            </button>
            <button
              onClick={handleAddToCartWithQty}
              disabled={addingToCart}
              className={`flex items-center gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                addingToCart
                  ? "bg-[#4a7c44] text-white"
                  : "bg-[#1e3040] hover:bg-[#4a7c44] text-white"
              }`}
            >
              {addingToCart ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              {addingToCart ? "Đã thêm!" : "Thêm vào giỏ"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
