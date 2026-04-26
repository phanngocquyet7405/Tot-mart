"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ShoppingCart,
} from "lucide-react";
import CartItem from "./cart_item";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

export default function CartDrawer({ open, setOpen }) {
  const { cartItems, cartTotal, addToCart } = useCart();
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Giả lập danh sách sản phẩm yêu thích/gợi ý
  const suggestions = [
    { id: "s1", name: "SFC Plum Soda", price: 50000, image: "/soda.jpg" },
    { id: "s2", name: "Glico Pretz Sticks", price: 35000, image: "/pretz.jpg" },
    {
      id: "s3",
      name: "Coca-Cola Strawberry",
      price: 45000,
      image: "/coke.jpg",
    },
  ];

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-1001 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Main Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full z-1002 flex"
          >
            {/* CỘT TRÁI: Customers Also Loved (Có thể thu gọn) */}
            <motion.div
              animate={{ width: showSuggestions ? "320px" : "40px" }}
              className="h-full bg-[#E5E1D8] border-r border-gray-300 relative overflow-hidden hidden md:flex flex-col shadow-inner"
            >
              {/* Nút Toggle thu gọn giống Bokksu */}
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#E5E1D8] p-1 border-y border-l border-gray-400 rounded-l-md hover:bg-white transition-colors"
              >
                {showSuggestions ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </button>

              <AnimatePresence>
                {showSuggestions ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 w-[320px]"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-serif text-gray-800">
                        Customers Also Loved
                      </h3>
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="md:hidden"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-3 flex gap-4 items-center shadow-sm relative group"
                        >
                          <button
                            onClick={() => addToCart(item)}
                            className="absolute -left-2 -top-2 bg-emerald-800 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                          >
                            <PlusCircle size={20} />
                          </button>
                          <div className="w-16 h-16 relative bg-gray-50 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-sm font-bold text-orange-700">
                              ₫{item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p
                      className="vertical-text font-serif text-gray-600 uppercase tracking-widest text-sm"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      Customers Also Loved
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CỘT PHẢI: Market Items (Giỏ hàng chính) */}
            <div className="h-full w-screen md:w-125 bg-white flex flex-col shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center bg-white shrink-0">
                <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
                  Market Items
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500">
                    {cartItems.length} item(s)
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Danh sách sản phẩm trong giỏ */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {cartItems.length > 0 ? (
                  cartItems.map((p, i) => (
                    <CartItem key={p._id || p.id || i} product={p} />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <ShoppingCart size={48} strokeWidth={1} />
                    <p className="italic">Giỏ hàng của bạn đang trống.</p>
                  </div>
                )}
              </div>

              {/* Footer Thanh toán */}
              <div className="p-8 border-t bg-white shrink-0 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900 uppercase">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>You Saved</span>
                    <span>₫0</span>
                  </div>
                </div>

                <button
                  disabled={cartItems.length === 0}
                  className="bg-[#1a4d2e] text-white py-4 rounded-md w-full font-bold shadow-lg hover:bg-emerald-900 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  PROCEED TO CHECKOUT
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full mt-4 text-center text-sm font-medium text-gray-500 underline hover:text-black transition-colors"
                >
                  Continue Without Checkout+
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
