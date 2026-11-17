"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import logger from "@/app/util/Logger";
import { matchQuoteLine } from "@/app/util/cartQuote.mjs";
import { cartLineKey } from "@/app/util/cartLine.mjs";
import { useCart } from "@/app/context/CartContext";
import { getAllProductsApi } from "@/app/services/api/productServices";
import CartItem from "./cart_item";

export default function CartDrawer({ open, setOpen }) {
  const router = useRouter();
  const t = useTranslations("cartDrawer");
  const {
    cartItems,
    cartTotal,
    cartQuote,
    cartPriceConfirmed,
    addToCart,
    isMounted,
  } = useCart();

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // 1. Khóa cuộn trang khi mở Drawer, khôi phục khi đóng hoặc unmount
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [open]);

  // 2. Đóng Drawer bằng phím ESC
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  // 3. Tải danh sách sản phẩm gợi ý khi mở Drawer
  useEffect(() => {
    if (!open) return;

    let isSubscribed = true;
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await getAllProductsApi();
        const rawProducts = res?.data?.data || res?.data || [];

        if (isSubscribed && Array.isArray(rawProducts)) {
          const limitProducts = rawProducts.slice(0, 5).map((item) => ({
            _id: item._id,
            name: item.name,
            price: item.price || 0,
            image: item.images?.[0]?.url || "/assets/placeholder.png",
          }));
          setSuggestions(limitProducts);
        }
      } catch (error) {
        logger.error("Lỗi lấy sản phẩm gợi ý:", error);
      } finally {
        if (isSubscribed) {
          setLoadingSuggestions(false);
        }
      }
    };

    fetchSuggestions();
    return () => {
      isSubscribed = false;
    };
  }, [open]);

  const handleAddSuggestion = (item) => {
    addToCart(item);
    toast.success(t("addSuccess", { name: item.name }));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 1. OVERLAY phủ toàn màn hình từ top: 0, z-index 70 cao hơn header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-70 bg-foreground/45 backdrop-blur-xs"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* 2. DRAWER CONTAINER phủ từ top: 0, z-index 80 cao hơn header */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-80 flex h-full h-[100dvh] max-h-screen shadow-2xl border-l border-border overflow-hidden"
          >
            {/* CỘT TRÁI: Sản phẩm gợi ý (Ẩn trên mobile để tối ưu màn hình cảm ứng) */}
            <motion.div
              animate={{ width: showSuggestions ? 320 : 40 }}
              className="h-full bg-background border-r border-border relative hidden md:flex flex-col shadow-inner shrink-0"
            >
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background p-1.5 border-y border-l border-border rounded-l-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors shadow-xs active:scale-95 pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center"
                aria-label={showSuggestions ? "Thu gọn gợi ý" : "Mở rộng gợi ý"}
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
                    className="w-[320px] h-full flex flex-col"
                  >
                    <div className="flex items-center gap-2 p-6 pb-4 border-b border-border/60 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <h3 className="text-[13px] font-black uppercase tracking-widest text-foreground">
                        {t("suggestionsTitle")}
                      </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
                      {loadingSuggestions ? (
                        <div className="text-center py-10 text-muted-foreground text-xs italic">
                          {t("loadingSuggestions")}
                        </div>
                      ) : suggestions.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-xs">
                          {t("noSuggestions")}
                        </div>
                      ) : (
                        suggestions.map((item) => (
                          <div
                            key={item._id}
                            className="bg-card rounded-xl p-3 flex gap-4 items-center shadow-xs relative group border border-border hover:border-primary/50 transition-colors"
                          >
                            <button
                              onClick={() => handleAddSuggestion(item)}
                              className="absolute -left-2 -top-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 active:scale-90 transition-all z-10 pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center"
                              aria-label="Thêm vào giỏ"
                            >
                              <PlusCircle size={18} />
                            </button>
                            <div className="w-16 h-16 relative bg-background rounded-lg overflow-hidden shrink-0 border border-border">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain p-1.5"
                                sizes="64px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-foreground line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors">
                                {item.name}
                              </p>
                              <p className="text-[13px] font-black text-primary mt-1">
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
                      className="font-black text-muted-foreground uppercase tracking-[0.2em] text-[11px] whitespace-nowrap"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {t("suggestionsCollapsed")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CỘT PHẢI: Giỏ hàng chính */}
            <div className="h-full w-screen max-w-[100vw] sm:w-[420px] md:w-105 bg-card flex flex-col shadow-2xl shrink-0">
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-border flex justify-between items-center bg-card shrink-0 pt-[max(1rem,env(safe-area-inset-top,0px))]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShoppingCart size={16} />
                  </div>
                  <h2 className="text-[14px] font-black uppercase tracking-widest text-foreground">
                    {t("title")}
                  </h2>
                  {isMounted && cartItems.length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded-full ml-1 tabular-nums">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground active:scale-95 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                  aria-label={t("close")}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {isMounted && cartItems.length > 0 ? (
                  cartItems.map((p) => (
                    <CartItem
                      key={cartLineKey(p)}
                      product={p}
                      lineTotal={matchQuoteLine(p, cartQuote)?.totalPrice}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 bg-background border border-border rounded-full flex items-center justify-center mb-5">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-[15px] font-black text-foreground mb-2 uppercase tracking-wide">
                      {t("emptyTitle")}
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed max-w-50">
                      {t("emptyDesc")}
                    </p>
                    <button
                      onClick={() => setOpen(false)}
                      className="mt-6 text-[12px] font-bold text-primary hover:text-primary uppercase tracking-widest border-b-2 border-primary/40 hover:border-primary transition-colors pb-1 active:translate-y-0.5 pointer-coarse:min-h-11 flex items-center"
                    >
                      {t("continueShopping")}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Thanh toán */}
              {isMounted && cartItems.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-border bg-card shrink-0 pb-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom,0px)))]">
                  <div className="space-y-1 mb-5">
                    <div className="flex justify-between items-end">
                      <span className="text-[12px] text-muted-foreground uppercase tracking-widest font-bold">
                        {cartPriceConfirmed
                          ? t("subtotalConfirmed")
                          : t("subtotalEstimated")}
                      </span>
                      <span className="text-xl font-bold text-foreground tabular-nums">
                        {cartTotal.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-right">
                      {cartPriceConfirmed
                        ? t("shippingNoteConfirmed")
                        : t("shippingNoteEstimated")}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        router.push("/checkout");
                        setOpen(false);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] pointer-coarse:min-h-11"
                    >
                      {t("checkoutNow")}
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => {
                        router.push("/cart");
                        setOpen(false);
                      }}
                      className="w-full bg-card/60 border border-border text-foreground hover:bg-muted py-3 min-h-11 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-colors active:scale-[0.98] pointer-coarse:min-h-11"
                    >
                      {t("viewCartDetails")}
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
