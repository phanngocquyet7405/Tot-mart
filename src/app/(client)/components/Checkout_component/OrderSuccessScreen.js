"use client";
/**
 * OrderSuccessScreen.js
 * Màn hình xác nhận đặt hàng thành công
 * Chuẩn hóa màu sắc token: success semantic, primary terracotta, viền border.
 */

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

export function OrderSuccessScreen({ onNew, submitting = false }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: "easeOut" }}
        className="relative text-center max-w-md w-full py-10"
      >
        {/* Success Icon */}
        <motion.div
          initial={shouldReduceMotion ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.15, type: "spring", stiffness: 240, damping: 18 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-success-text/10 border-2 border-success-text/25 flex items-center justify-center mx-auto mb-6 shadow-xs"
        >
          <CheckCircle2 size={44} className="text-success-text" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.25 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 px-4">
            Cảm ơn bạn đã tin tưởng TotMart. Đơn hàng đang được xử lý và sẽ được liên hệ giao sớm nhất có thể.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.35 }}
          className="flex flex-col gap-3"
        >
          <button
            type="button"
            onClick={() => router.push("/profile/orders")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors active:scale-[0.98] shadow-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Xem đơn hàng của tôi
          </button>
          {onNew && (
            <button
              type="button"
              onClick={onNew}
              disabled={submitting}
              className="w-full border border-border bg-card text-foreground py-3 min-h-11 rounded-xl font-bold hover:bg-muted transition-colors text-xs uppercase tracking-wider"
            >
              Đặt đơn mới
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full border border-border bg-card/60 text-muted-foreground hover:text-foreground py-3 min-h-11 rounded-xl font-semibold uppercase tracking-wider text-xs hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
          >
            Tiếp tục mua sắm
            <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`rounded-full ${i === 1 ? "w-2.5 h-2.5 bg-primary" : "w-1.5 h-1.5 bg-border"}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
