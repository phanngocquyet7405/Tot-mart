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
    <div className="bg-background border-y border-border px-6 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 md:items-start">
          {/* ─── Left: Carousel ─── */}
          <div className="flex flex-col gap-5">
            <div className="relative w-full overflow-hidden rounded-3xl border border-border shadow-xs bg-muted">
              <div className="aspect-square relative">
                <Image
                  src={slides[currentSlide].src}
                  alt="TotMart Subscription Box"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-foreground/15 to-transparent pointer-events-none" />
              </div>

              {/* Nav Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 backdrop-blur-xs border border-border p-2 hover:bg-card hover:shadow-md transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 backdrop-blur-xs border border-border p-2 hover:bg-card hover:shadow-md transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
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
                      ? "w-6 h-2 bg-primary"
                      : "w-2 h-2 bg-muted hover:bg-primary/40"
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
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                Your First Box Includes
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-foreground mt-2 leading-tight">
                20+ Đặc Sản Nhật Bản, Bánh Kẹo & Trà Cao Cấp!
              </h2>
            </div>

            {/* Features Grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-[11px] font-black text-foreground tracking-wider uppercase">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
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
              className="w-full rounded-2xl bg-primary hover:bg-primary/90 px-8 py-4 text-center text-xs font-black text-white uppercase tracking-widest transition-all duration-300 shadow-xs hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
