"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import CartItem from "./cart_item";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
// Import API lấy danh sách sản phẩm
import { getAllProductsApi } from "@/app/services/api/productServices";
import { toast } from "sonner";

export default function CartDrawer({ open, setOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, cartTotal, addToCart, isMounted } = useCart();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const getDrawerHeight = () => {
    return "calc(100vh - var(--ann-h, 40px))";
  };

  // Khóa cuộn trang khi mở Drawer
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Gọi API lấy sản phẩm gợi ý khi mở Drawer
  useEffect(() => {
    if (!open) return;

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await getAllProductsApi();
        // Kiểm tra cấu trúc trả về từ axiosConfig của bạn
        const rawProducts = res?.data?.data || res?.data || [];

        if (Array.isArray(rawProducts)) {
          // Lấy tối đa 5 sản phẩm đầu tiên
          const limitProducts = rawProducts.slice(0, 5).map((item) => ({
            _id: item._id, // Giữ nguyên _id để đồng bộ giỏ hàng
            name: item.name,
            price: item.price || 0,
            image: item.images?.[0]?.url || "/placeholder.jpg", // Lấy ảnh đầu tiên hoặc ảnh mặc định
          }));
          setSuggestions(limitProducts);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm gợi ý:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [open]);

  const handleAddSuggestion = (item) => {
    addToCart(item);
    toast.success(`Đã thêm ${item.name} vào giỏ hàng 🛒`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 1. OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 bg-stone-900/40 z-55 backdrop-blur-sm"
            style={{ top: "var(--ann-h, 40px)" }}
            onClick={() => setOpen(false)}
          />

          {/* 2. MAIN DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 z-56 flex shadow-2xl border-l border-stone-200 overflow-hidden"
            style={{
              top: "var(--ann-h, 40px)",
              height: getDrawerHeight(),
            }}
          >
            {/* CỘT TRÁI: Sản phẩm gợi ý */}
            <motion.div
              animate={{ width: showSuggestions ? 320 : 40 }}
              className="h-full bg-[#f5f0e8] border-r border-stone-200 relative hidden md:flex flex-col shadow-inner"
            >
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#f5f0e8] p-1.5 border-y border-l border-stone-300 rounded-l-lg hover:bg-white text-stone-500 hover:text-amber-800 transition-colors shadow-sm active:scale-95"
              >
                {showSuggestions ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
              </button>

              <AnimatePresence mode="wait">
                {showSuggestions ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 w-[320px] h-full overflow-y-auto"
                  >
                    <div className="flex items-center mb-6 gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h3 className="text-[13px] font-black uppercase tracking-widest text-stone-800">
                        Có thể bạn sẽ thích
                      </h3>
                    </div>

                    <div className="space-y-3 pb-4">
                      {loadingSuggestions ? (
                        <div className="text-center py-10 text-stone-500 text-xs italic">
                          Đang tải gợi ý...
                        </div>
                      ) : suggestions.length === 0 ? (
                        <div className="text-center py-10 text-stone-400 text-xs">
                          Không có sản phẩm gợi ý.
                        </div>
                      ) : (
                        suggestions.map((item) => (
                          <div
                            key={item._id}
                            className="bg-white rounded-xl p-3 flex gap-4 items-center shadow-sm relative group border border-stone-100 hover:border-amber-300 transition-colors"
                          >
                            <button
                              onClick={() => handleAddSuggestion(item)}
                              className="absolute -left-2 -top-2 bg-amber-500 text-white rounded-full p-1 shadow-md hover:bg-amber-600 active:scale-90 transition-all z-10"
                              aria-label="Thêm vào giỏ"
                            >
                              <PlusCircle size={18} />
                            </button>
                            <div className="w-16 h-16 relative bg-[#faf8f4] rounded-lg overflow-hidden shrink-0 border border-stone-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain p-1.5"
                                sizes="64px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-stone-800 line-clamp-1 uppercase tracking-tight group-hover:text-amber-800 transition-colors">
                                {item.name}
                              </p>
                              <p className="text-[13px] font-black text-amber-700 mt-1">
                                {item.price.toLocaleString("vi-VN")}₫
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full flex items-center justify-center py-8"
                  >
                    <p
                      className="font-black text-stone-400 uppercase tracking-[0.2em] text-[11px] whitespace-nowrap"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      Sản phẩm gợi ý
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CỘT PHẢI: Giỏ hàng chính */}
            <div className="h-full w-screen md:w-105 bg-[#faf8f4] flex flex-col shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                    <ShoppingCart size={16} />
                  </div>
                  <h2 className="text-[14px] font-black uppercase tracking-widest text-stone-900">
                    Giỏ hàng
                  </h2>
                  {isMounted && cartItems.length > 0 && (
                    <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-800 active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isMounted && cartItems.length > 0 ? (
                  cartItems.map((p, i) => (
                    <CartItem key={p._id || p.id || i} product={p} />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 bg-white border border-stone-200 shadow-sm rounded-full flex items-center justify-center mb-5">
                      <ShoppingCart className="h-8 w-8 text-stone-300" />
                    </div>
                    <p className="text-[15px] font-black text-stone-800 mb-2 uppercase tracking-wide">
                      Giỏ hàng trống
                    </p>
                    <p className="text-[13px] text-stone-500 leading-relaxed max-w-50">
                      Chưa có sản phẩm nào. Hãy khám phá các hộp quà của chúng
                      tôi nhé!
                    </p>
                    <button
                      onClick={() => setOpen(false)}
                      className="mt-6 text-[12px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-widest border-b-2 border-amber-300 hover:border-amber-600 transition-colors pb-1 active:translate-y-0.5"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Thanh toán */}
              {isMounted && cartItems.length > 0 && (
                <div className="p-6 border-t border-stone-200 bg-white shrink-0">
                  <div className="space-y-1 mb-5">
                    <div className="flex justify-between items-end">
                      <span className="text-[12px] text-stone-500 uppercase tracking-widest font-bold">
                        Tạm tính
                      </span>
                      <span className="text-xl font-black text-amber-800">
                        {cartTotal.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 text-right">
                      Phí vận chuyển được tính ở bước thanh toán.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        router.push("/checkout");
                        setOpen(false);
                      }}
                      className="w-full bg-amber-800 hover:bg-amber-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-[0.98]"
                    >
                      Thanh toán ngay
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => {
                        router.push("/cart");
                        setOpen(false);
                      }}
                      className="w-full bg-[#faf8f4] border border-stone-200 text-stone-700 hover:bg-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:border-amber-400 hover:text-amber-800 transition-all active:scale-[0.98]"
                    >
                      Xem chi tiết giỏ hàng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
