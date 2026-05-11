"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  Check,
  BookOpen,
  Package,
  Gift,
  Star,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Shield,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "../page";
import Image from "next/image";

const iconMap = {
  package: <Package className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
  star: <Star className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
};

export default function SubscriberSlugPage() {
  const { slug } = useParams();
  const router = useRouter();

  const plan = SUBSCRIPTION_PLANS.find((p) => p.slug === slug);

  if (!plan) {
    notFound();
  }

  // Khởi tạo state cho gói được chọn (ưu tiên gói có highlight)
  const [selectedPlanId, setSelectedPlanId] = useState(
    plan.plans.find((p) => p.highlight)?.id ??
      plan.plans[1]?.id ??
      plan.plans[0].id,
  );
  const [activeImage, setActiveImage] = useState(0);
  const thumbnailContainerRef = useRef(null);

  const selected = plan.plans.find((p) => p.id === selectedPlanId);

  const handleScroll = (direction) => {
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({
        top: direction === "up" ? -92 : 92,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="min-h-screen" style={{ background: "#FFFAF8" }}>
      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-2">
        <button
          onClick={() => router.push("/products/Subscriber")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Tất cả gói subscription
        </button>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <span
            className="hover:text-gray-700 cursor-pointer"
            onClick={() => router.push("/")}
          >
            Trang chủ
          </span>
          <ChevronRight className="w-3 h-3" />
          <span
            className="hover:text-gray-700 cursor-pointer"
            onClick={() => router.push("/products/Subscriber")}
          >
            Subscription
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold" style={{ color: plan.accentColor }}>
            {plan.name}
          </span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* ── LEFT: Gallery ── */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-28 flex gap-4">
            {/* Thumbnail strip */}
            {plan.images.length > 1 && (
              <div className="hidden md:flex flex-col items-center gap-2">
                {plan.images.length > 4 && (
                  <button
                    onClick={() => handleScroll("up")}
                    className="p-1 hover:bg-white rounded-full shadow-sm border border-gray-200"
                  >
                    <ChevronUp
                      className="w-5 h-5"
                      style={{ color: plan.accentColor }}
                    />
                  </button>
                )}

                <div
                  ref={thumbnailContainerRef}
                  className="flex flex-col gap-3 overflow-y-hidden scroll-smooth"
                  style={{ maxHeight: "356px" }}
                >
                  {plan.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(idx)}
                      className={cn(
                        "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                        idx === activeImage
                          ? "scale-105 shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                      style={
                        idx === activeImage
                          ? { borderColor: plan.accentColor }
                          : {}
                      }
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {plan.images.length > 4 && (
                  <button
                    onClick={() => handleScroll("down")}
                    className="p-1 hover:bg-white rounded-full shadow-sm border border-gray-200"
                  >
                    <ChevronDown
                      className="w-5 h-5"
                      style={{ color: plan.accentColor }}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Main image display */}
            <div
              className="flex-1 relative overflow-hidden rounded-2xl shadow-xl aspect-square"
              style={{ background: plan.bgColor }}
            >
              {plan.images.map((img, idx) => (
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
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div
                className="absolute bottom-0 left-0 right-0 z-20 p-4"
                style={{
                  background: `linear-gradient(to top, ${plan.accentColor}cc, transparent)`,
                }}
              >
                <p className="text-white font-black text-lg tracking-wide">
                  {plan.name}
                </p>
                <p className="text-white/80 text-xs">{plan.tagline}</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Content & Configuration ── */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            <header>
              <div className="flex items-center gap-3 mb-3">
                <p
                  className="text-xs tracking-[0.2em] uppercase font-bold"
                  style={{ color: plan.accentColor }}
                >
                  CHỌN GÓI ĐĂNG KÝ
                </p>
                <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                  #{plan.id}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight font-serif">
                {plan.name}
              </h1>
              <p className="mt-2 text-lg" style={{ color: plan.accentColor }}>
                {plan.tagline}
              </p>

              <div className="flex items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current"
                    style={{
                      color:
                        i < Math.floor(plan.rating) ? "#FBBF24" : "#E5E7EB",
                    }}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1 font-medium">
                  {plan.rating}/5 · {plan.reviewCount.toLocaleString()} đánh giá
                </span>
              </div>
            </header>

            {/* Plan selector cards */}
            <div className="grid gap-4">
              {plan.plans.map((p) => (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => setSelectedPlanId(p.id)}
                    className={cn(
                      "w-full rounded-2xl border-2 px-6 py-5 text-left transition-all",
                      selectedPlanId === p.id
                        ? "shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300",
                    )}
                    style={
                      selectedPlanId === p.id
                        ? {
                            borderColor: plan.accentColor,
                            background: plan.bgColor,
                          }
                        : {}
                    }
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                          style={
                            selectedPlanId === p.id
                              ? {
                                  borderColor: plan.accentColor,
                                  background: plan.accentColor,
                                }
                              : { borderColor: "#D1D5DB" }
                          }
                        >
                          {selectedPlanId === p.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#2C1810] text-lg block">
                            {p.label}
                          </span>
                          {p.badge && (
                            <Badge
                              className="mt-1 text-white text-[10px] uppercase tracking-tighter"
                              style={{ background: "#2C1810" }}
                            >
                              {p.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {p.savings && (
                          <span
                            className="text-sm font-bold block mb-1"
                            style={{ color: plan.accentColor }}
                          >
                            TIẾT KIỆM ${p.savings}
                          </span>
                        )}
                        <span className="text-xl font-black text-[#2C1810]">
                          ${p.price}
                          <span className="text-sm font-normal">/tháng</span>
                        </span>
                        {p.originalPrice && (
                          <span className="text-xs text-gray-400 line-through block">
                            ${p.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Bonus panel (visible when selected) */}
                  {p.bonusTitle && selectedPlanId === p.id && (
                    <div
                      className="mt-3 p-4 rounded-xl border-l-4 bg-white shadow-sm flex gap-4 items-center animate-in slide-in-from-top-2 duration-300"
                      style={{ borderColor: plan.accentColor }}
                    >
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#2C1810]">
                          {p.bonusTitle}
                        </p>
                        <p className="text-xs text-gray-500">{p.bonusDesc}</p>
                      </div>
                      {p.bonusCode && (
                        <Badge
                          variant="outline"
                          className="font-mono"
                          style={{
                            color: plan.accentColor,
                            borderColor: plan.accentColor,
                          }}
                        >
                          {p.bonusCode}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Checkout Action Area */}
            <div
              className="p-8 rounded-3xl text-white flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl"
              style={{ background: "#2C1810" }}
            >
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                  Tổng thanh toán hôm nay
                </p>
                <p className="text-4xl font-bold">
                  ${(selected.price * selected.months).toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 mt-2 italic">
                  Thanh toán mỗi {selected.months} tháng. Hủy bất cứ lúc nào.
                </p>
              </div>
              <Button
                className="w-full md:w-auto text-white px-10 py-7 rounded-2xl text-lg font-bold transition-all hover:opacity-90"
                style={{ background: plan.accentColor }}
                onClick={() =>
                  router.push(
                    `/checkout?plan=${plan.slug}&tier=${selected.id}&price=${selected.price * selected.months}`,
                  )
                }
              >
                Đăng ký ngay <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid gap-4 py-8 border-y border-gray-100">
              {plan.features.map((f, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: plan.bgColor,
                      color: plan.accentColor,
                    }}
                  >
                    {iconMap[f.icon] || <Check className="w-5 h-5" />}
                  </div>
                  <p className="text-[#4A3028] font-medium">{f.text}</p>
                </div>
              ))}
            </div>

            {/* Detailed Description */}
            <div className="space-y-6 pb-10">
              <h3 className="text-2xl font-bold text-[#2C1810]">
                {plan.details.heading}
              </h3>
              <p className="text-[#5C3D30] leading-relaxed italic">
                {plan.details.description}
              </p>
              <ul className="space-y-4">
                {plan.details.bullets.map((b, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <span
                      className="mt-2 w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ background: plan.accentColor }}
                    />
                    <p className="text-[#4A3028]">
                      <span className="font-bold">{b.bold}</span> {b.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
