"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export function MonthlyThemes() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const themes = [
    {
      id: 1,
      title: "AUTUMN HUES AWAKEN",
      image:
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      title: "FULL MOON HARVEST",
      image:
        "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      title: "FIREWORKS MATSURI",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      title: "SUMMER IN OKINAWA",
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 5,
      title: "LUSCIOUS KYUSHU",
      image:
        "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 6,
      title: "WINTER SNOWFALL",
      image:
        "https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 7,
      title: "CHERRY BLOSSOM",
      image:
        "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 8,
      title: "GOLDEN GLOW",
      image:
        "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 9,
      title: "OCEAN BREEZE",
      image:
        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 10,
      title: "SUNSET HARMONY",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80",
    },
  ];

  const visibleSlides = 5;
  const maxSlide = themes.length - visibleSlides;
  const slideWidth = 100 / visibleSlides;

  const nextSlide = () => {
    if (currentSlide < maxSlide) setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide((prev) => prev - 1);
  };

  return (
    <section className="mb-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#C85C3C]">
          DISCOVER MONTHLY THEMES
        </span>
        <h2 className="font-serif text-2xl lg:text-3xl font-black text-[#2C1810] mt-1">
          Khám Phá Các Chủ Đề Hàng Tháng
        </h2>
        <p className="text-sm text-[#7A645D] mt-3 leading-relaxed">
          Mỗi tháng một bộ sưu tập mới xoay quanh lễ hội, vùng miền và mùa sắc
          đặc trưng của Nhật Bản.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="absolute left-0 z-10 -translate-x-5 rounded-full bg-white border border-[#F0DDD5] shadow-md p-2 hover:border-[#C85C3C]/40 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous themes"
        >
          <ChevronLeft className="h-5 w-5 text-[#2C1810]" />
        </button>

        {/* Carousel Track */}
        <div className="w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * slideWidth}%)` }}
          >
            {themes.map((theme) => (
              <div
                key={theme.id}
                style={{ width: `${slideWidth}%` }}
                className="shrink-0 px-2 group cursor-pointer"
              >
                {/* Card Image */}
                <div className="aspect-4/5 rounded-2xl overflow-hidden border border-[#F0DDD5] bg-[#F0DDD5] relative mb-3">
                  <Image
                    src={theme.image}
                    alt={theme.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="20vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                </div>

                {/* Label */}
                <h3 className="font-serif text-[11px] font-black text-[#2C1810] tracking-wider text-center group-hover:text-[#C85C3C] transition-colors leading-tight uppercase">
                  {theme.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === maxSlide}
          className="absolute right-0 z-10 translate-x-5 rounded-full bg-white border border-[#F0DDD5] shadow-md p-2 hover:border-[#C85C3C]/40 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next themes"
        >
          <ChevronRight className="h-5 w-5 text-[#2C1810]" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-6">
        {Array.from({ length: maxSlide + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentSlide
                ? "w-5 h-2 bg-[#C85C3C]"
                : "w-2 h-2 bg-[#F0DDD5] hover:bg-[#C85C3C]/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
