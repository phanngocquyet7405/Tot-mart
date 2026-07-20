/**
 * OrderSuccessScreen.js
 * Màn hình xác nhận đặt hàng thành công
 */

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

export function OrderSuccessScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFAF8] flex items-center justify-center px-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C85C3C]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#F0DDD5]/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative text-center max-w-md w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 18 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FFF0EB] to-[#F0DDD5] border-2 border-[#C85C3C]/20 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#C85C3C]/10"
        >
          <CheckCircle2 size={48} className="text-[#C85C3C]" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h1 className="text-3xl font-black text-[#2C1810] mb-3 tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 px-4">
            Cảm ơn bạn đã tin tưởng TotMart. Đơn hàng đang được xử lý
            và sẽ giao sớm nhất có thể.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => router.push("/profile")}
            className="w-full bg-[#C85C3C] hover:bg-[#B14B2D] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98] shadow-lg shadow-[#C85C3C]/20 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={15} />
            Xem đơn hàng của tôi
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full border-2 border-[#F0DDD5] text-stone-500 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:border-[#C85C3C]/30 hover:text-[#C85C3C] transition-all flex items-center justify-center gap-1.5"
          >
            Tiếp tục mua sắm
            <ArrowRight size={13} />
          </button>
        </motion.div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-1.5 mt-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
              className={`rounded-full ${i === 1 ? "w-3 h-3 bg-[#C85C3C]" : "w-1.5 h-1.5 bg-[#F0DDD5]"}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
