"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=1080&fit=crop",
    badge: "TotMart Craft & Gift",
    title: "Khám Phá Niềm Vui Tuyển Chọn Mỗi Tháng",
    subtitle:
      "Sản phẩm thủ công và hữu cơ chất lượng cao từ các nghệ nhân bản địa, gói trọn tinh hoa trao gửi tận nơi.",
    primaryCta: { label: "Bắt đầu trải nghiệm", href: "/subscription" },
    secondaryCta: { label: "Khám phá hộp quà", href: "/box" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=1080&fit=crop",
    badge: "Năng lượng từ thiên nhiên",
    title: "Tinh Hoa Nông Sản & Làng Nghề Việt",
    subtitle:
      "Kết nối giá trị truyền thống bền vững, mang hương vị đất lành và câu chuyện nghệ nhân vào không gian sống.",
    primaryCta: { label: "Mua sắm ngay", href: "/products" },
    secondaryCta: { label: "Gian hàng đối tác", href: "/brands" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&h=1080&fit=crop",
    badge: "Hộp quà theo mùa",
    title: "Gói Trọn Yêu Thương & Tinh Tế",
    subtitle:
      "Từng hộp quà được thiết kế chỉn chu với thông điệp trân quý, phù hợp mọi dịp kỷ niệm, tri ân và trao gửi tình thân.",
    primaryCta: { label: "Xem bộ sưu tập", href: "/gift" },
    secondaryCta: { label: "Gói quà doanh nghiệp", href: "/pages/contact-us" },
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Tự động chuyển slide mỗi 6 giây, tạm dừng khi hover/focus hoặc nếu user bật prefers-reduced-motion
  useEffect(() => {
    if (shouldReduceMotion || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, isPaused, nextSlide]);

  const activeSlide = slides[currentIndex];

  return (
    <section
      className="relative h-[85vh] min-h-[540px] max-h-[860px] w-full overflow-hidden select-none bg-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Hero Carousel"
    >
      {/* 1. Background Images (Chỉ active slide có opacity-100, inactive ẩn hoàn toàn) */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity ease-in-out ${
              shouldReduceMotion ? "duration-0" : "duration-700"
            } ${isActive ? "opacity-100 z-1" : "opacity-0 pointer-events-none z-0"}`}
            aria-hidden={!isActive}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Lớp phủ đa tầng bảo đảm đủ tương phản cho văn bản sáng màu */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/50 to-black/35" />
          </div>
        );
      })}

      {/* 2. Slide Content với AnimatePresence mode="wait" (Slide cũ exit xong slide mới mới xuất hiện, loại trừ 100% việc chữ bị chồng nhau) */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 16 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -16 }
              }
              transition={{
                duration: shouldReduceMotion ? 0.05 : 0.35,
                ease: "easeOut",
              }}
              className="text-center"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md mb-5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white">
                  {activeSlide.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-5 leading-tight tracking-tight drop-shadow-md text-balance max-w-3xl mx-auto">
                {activeSlide.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal text-pretty">
                {activeSlide.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-xl pointer-coarse:min-h-11 transition-transform active:scale-95"
                >
                  <Link href={activeSlide.primaryCta.href}>
                    {activeSlide.primaryCta.label}
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-sm font-bold uppercase tracking-wider bg-white/10 text-white border-white/40 hover:bg-white hover:text-foreground backdrop-blur-md rounded-xl pointer-coarse:min-h-11 transition-all active:scale-95"
                >
                  <Link href={activeSlide.secondaryCta.href}>
                    {activeSlide.secondaryCta.label}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Nút điều hướng Slide Trái / Phải */}
      <div className="absolute inset-y-0 left-3 sm:left-6 z-20 flex items-center pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 pointer-coarse:min-h-11 pointer-coarse:min-w-11 shadow-lg"
          aria-label="Slide trước"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="absolute inset-y-0 right-3 sm:right-6 z-20 flex items-center pointer-events-none">
        <button
          onClick={nextSlide}
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 pointer-coarse:min-h-11 pointer-coarse:min-w-11 shadow-lg"
          aria-label="Slide tiếp theo"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 4. Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center ${
                isActive
                  ? "w-8 bg-primary shadow-xs"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Chuyển tới slide ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="sr-only">Slide {index + 1}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HeroSection;
