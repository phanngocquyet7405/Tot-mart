"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Check,
  BookOpen,
  Package,
  Gift,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Mock API (Thêm nhiều ảnh để test tính năng scroll) ---
async function fetchProductData() {
  return {
    title: "Snack Box Subscription",
    subtitle: "CHOOSE YOUR PLAN",
    promoCode: "SAKURAGIFTS",
    promoText: "Free sakura gifts with 3, 6, and 12-month plans. Use code",
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
        alt: "Bokksu 1",
      },
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
        alt: "Bokksu 2",
      },
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80",
        alt: "Bokksu 3",
      },
      {
        id: "img-4",
        url: "https://images.unsplash.com/photo-1582213706822-21966d588448?w=800&q=80",
        alt: "Bokksu 4",
      },
      {
        id: "img-5",
        url: "https://images.unsplash.com/photo-1511018556340-d16986a1c194?w=800&q=80",
        alt: "Bokksu 5",
      },
    ],
    plans: [
      {
        id: "12m",
        label: "12 Months",
        months: 12,
        price: 31.99,
        originalPrice: 39.99,
        savings: 96,
        badge: "BEST VALUE",
      },
      {
        id: "6m",
        label: "6 Months",
        months: 6,
        price: 32.99,
        originalPrice: 39.99,
        savings: 42,
        badge: "POPULAR",
        highlight: true,
        bonusTitle: "LIMITED-EDITION SAKURA BOX",
        bonusDesc: "Plus Sakura Matcha Kit Kats",
        bonusCode: "SAKURAGIFTS",
      },
      {
        id: "3m",
        label: "3 Months",
        months: 3,
        price: 34.99,
        originalPrice: 39.99,
        savings: 15,
      },
      { id: "1m", label: "1 Month", months: 1, price: 39.99 },
    ],
    features: [
      { icon: "package", text: "20+ Japan-exclusive snacks" },
      { icon: "book", text: "20 to 24-page Culture Guide" },
      { icon: "gift", text: "Limited-Time Bonus: 2 Rare Snacks added" },
    ],
    details: {
      heading: "Experience Japan From Home",
      description:
        "Bokksu delivers to your door the experience of tasting authentic Japanese snacks, candies, and teas sourced directly from family makers.",
      bullets: [
        {
          bold: "All subscribers",
          text: " will receive our spring-edition Sakura Silk Lounge box.",
        },
        {
          bold: "The box includes 20–22 items",
          text: " curated around the elegance of cherry blossom season.",
        },
      ],
    },
  };
}

const iconMap = {
  package: <Package className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
};

export default function TotBoxProductChoosePlan() {
  const [product, setProduct] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("6m");
  const [activeImage, setActiveImage] = useState(0);

  // Ref để điều khiển cuộn danh sách ảnh con
  const thumbnailContainerRef = useRef(null);

  useEffect(() => {
    fetchProductData().then(setProduct);
  }, []);

  const handleScroll = (direction) => {
    if (thumbnailContainerRef.current) {
      const scrollAmount = 92; // Chiều cao ảnh (80px) + gap (12px)
      thumbnailContainerRef.current.scrollBy({
        top: direction === "up" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!product) return <div className="p-20 text-center">Loading...</div>;

  const selected = product.plans.find((p) => p.id === selectedPlan);

  return (
    <section
      id="choose-plan"
      className="w-full py-12 md:py-20"
      style={{ background: "#FFFAF8" }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-start relative">
          {/* CỘT TRÁI: Gallery Thiết kế lại */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-28 flex gap-4">
            {/* Danh sách ảnh con bên trái (Chỉ hiện trên desktop/tablet) */}
            <div className="hidden md:flex flex-col items-center gap-2">
              {product.images.length > 4 && (
                <button
                  onClick={() => handleScroll("up")}
                  className="p-1 hover:bg-white rounded-full shadow-sm border border-gray-200 transition-colors"
                >
                  <ChevronUp className="w-5 h-5 text-[#C85C3C]" />
                </button>
              )}

              <div
                ref={thumbnailContainerRef}
                className="flex flex-col gap-3 overflow-y-hidden transition-all duration-300 scroll-smooth"
                style={{ maxHeight: "356px" }} // (80px * 4) + (12px * 3) = 356px (vừa đủ 4 ảnh)
              >
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      idx === activeImage
                        ? "border-[#C85C3C] scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {product.images.length > 4 && (
                <button
                  onClick={() => handleScroll("down")}
                  className="p-1 hover:bg-white rounded-full shadow-sm border border-gray-200 transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-[#C85C3C]" />
                </button>
              )}
            </div>

            {/* Ảnh chính bên phải của Gallery */}
            <div className="flex-1 relative overflow-hidden rounded-2xl shadow-xl aspect-square bg-[#FFE8E0]">
              {product.images.map((img, idx) => (
                <div
                  key={img.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 ease-in-out",
                    idx === activeImage ? "opacity-100 z-10" : "opacity-0 z-0",
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: Nội dung (Giữ nguyên) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            <header>
              <p className="text-xs tracking-[0.2em] uppercase text-[#C85C3C] mb-3 font-bold">
                {product.subtitle}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight font-serif">
                {product.title}
              </h2>
            </header>

            <div className="grid gap-4">
              {product.plans.map((plan) => (
                <div key={plan.id} className="relative">
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "w-full rounded-2xl border-2 px-6 py-5 text-left transition-all",
                      selectedPlan === plan.id
                        ? "border-[#C85C3C] bg-[#FFF0EB] shadow-md"
                        : "border-[#E8D5CC] bg-white hover:border-[#D8C5BC]",
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            selectedPlan === plan.id
                              ? "border-[#C85C3C] bg-[#C85C3C]"
                              : "border-gray-300",
                          )}
                        >
                          {selectedPlan === plan.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#2C1810] text-lg block">
                            {plan.label}
                          </span>
                          {plan.badge && (
                            <Badge className="mt-1 bg-[#2C1810] text-white text-[10px] uppercase tracking-tighter">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {plan.savings && (
                          <span className="text-sm text-[#C85C3C] font-bold block mb-1">
                            SAVE ${plan.savings}
                          </span>
                        )}
                        <span className="text-xl font-black text-[#2C1810]">
                          ${plan.price}
                          <span className="text-sm font-normal">/mo</span>
                        </span>
                      </div>
                    </div>
                  </button>
                  {plan.bonusTitle && selectedPlan === plan.id && (
                    <div className="mt-3 p-4 rounded-xl border-l-4 border-[#C85C3C] bg-white shadow-sm flex gap-4 items-center animate-in slide-in-from-top-2 duration-300">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#2C1810]">
                          {plan.bonusTitle}
                        </p>
                        <p className="text-xs text-[#7A5C52]">
                          {plan.bonusDesc}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[#C85C3C] border-[#C85C3C] font-mono"
                      >
                        {plan.bonusCode}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 rounded-3xl bg-[#2C1810] text-white flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                  Total Due Today
                </p>
                <p className="text-4xl font-bold">
                  ${(selected.price * selected.months).toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 mt-2 italic">
                  Billed every {selected.months} months. Cancel anytime.
                </p>
              </div>
              <Button className="w-full md:w-auto bg-[#C85C3C] hover:bg-[#B14B2D] text-white px-10 py-7 rounded-2xl text-lg font-bold transition-all hover:translate-y-0.5">
                SELECT THIS PLAN <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="grid gap-4 py-8 border-y border-[#F0DDD5]">
              {product.features.map((f, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFE0D6] text-[#C85C3C] flex items-center justify-center shrink-0">
                    {iconMap[f.icon] || <Check className="w-5 h-5" />}
                  </div>
                  <p className="text-[#4A3028] font-medium">{f.text}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6 pb-10">
              <h3 className="text-2xl font-bold text-[#2C1810]">
                {product.details.heading}
              </h3>
              <p className="text-[#5C3D30] leading-relaxed italic">
                {product.details.description}
              </p>
              <ul className="space-y-4">
                {product.details.bullets.map((b, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[#C85C3C] shrink-0 group-hover:scale-125 transition-transform" />
                    <p className="text-[#4A3028]">
                      <span className="font-bold">{b.bold}</span> {b.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
