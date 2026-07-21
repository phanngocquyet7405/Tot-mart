/**
 * OrderSuccessScreen.js
 * Màn hình xác nhận đặt hàng thành công
 * Palette: emerald-600 success icon (semantic), indigo-600 primary buttons
 */

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

export function OrderSuccessScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl" />
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
          className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-600/20 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-600/10"
        >
          <CheckCircle2 size={48} className="text-emerald-600" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-8 px-4">
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={15} />
            Xem đơn hàng của tôi
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full border-2 border-slate-200 text-slate-600 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:border-indigo-600/30 hover:text-indigo-600 transition-all duration-200 flex items-center justify-center gap-1.5"
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
              className={`rounded-full ${i === 1 ? "w-3 h-3 bg-indigo-600" : "w-1.5 h-1.5 bg-slate-200"}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
