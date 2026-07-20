"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Leaf,
  BookOpen,
  Palette,
  Crown,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export function SubscriptionShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const features = [
    {
      icon: Gift,
      title: "GIFT-WITH-PURCHASE",
      description: "Hội viên 3, 6, 12 tháng nhận ngay quà tặng độc quyền.",
    },
    {
      icon: Palette,
      title: "AUTHENTIC TREATS",
      description: "Bánh mochi, senbei, kẹo trái cây chính gốc Nhật.",
    },
    {
      icon: Leaf,
      title: "TRÀ CAO CẤP",
      description: "Mỗi tháng một loại trà mới — matcha, hojicha, sencha.",
    },
    {
      icon: BookOpen,
      title: "SỔ TAY 22-24 TRANG",
      description: "Câu chuyện nguồn gốc, thành phần và văn hóa ẩm thực.",
    },
    {
      icon: Sparkles,
      title: "NGỌT & MẶN",
      description: "Sự kết hợp đa dạng hương vị cho mọi khẩu vị.",
    },
    {
      icon: Crown,
      title: "ĐỘC QUYỀN TOTMART",
      description: "Sản phẩm chỉ có tại TotMart, từ các nghệ nhân địa phương.",
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="bg-[#FFF5F2] border-y border-[#F0DDD5] px-6 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 md:items-start">
          {/* ─── Left: Carousel ─── */}
          <div className="flex flex-col gap-5">
            <div className="relative w-full overflow-hidden rounded-3xl border border-[#F0DDD5] shadow-lg shadow-[#C85C3C]/6 bg-[#F0DDD5]">
              <div className="aspect-square relative">
                <Image
                  src={slides[currentSlide].src}
                  alt="TotMart Subscription Box"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#2C1810]/20 to-transparent pointer-events-none" />
              </div>

              {/* Nav Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm border border-[#F0DDD5] p-2 hover:bg-white hover:shadow-md transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 text-[#2C1810]" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm border border-[#F0DDD5] p-2 hover:bg-white hover:shadow-md transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-[#2C1810]" />
              </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-6 h-2 bg-[#C85C3C]"
                      : "w-2 h-2 bg-[#F0DDD5] hover:bg-[#C85C3C]/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ─── Right: Content ─── */}
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C85C3C]">
                Your First Box Includes
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-[#2C1810] mt-2 leading-tight">
                20+ Đặc Sản Nhật Bản, Bánh Kẹo & Trà Cao Cấp!
              </h2>
            </div>

            {/* Features Grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0EB] border border-[#F0DDD5] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-[#C85C3C]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-[11px] font-black text-[#2C1810] tracking-wider uppercase">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#7A645D] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() =>
                document
                  .getElementById("plan-grid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full rounded-2xl bg-[#C85C3C] hover:bg-[#B14B2D] px-8 py-4 text-center text-xs font-black text-white uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#C85C3C]/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              ĐĂNG KÝ NGAY HÔM NAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
