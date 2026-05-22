"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ArrowRight,
  Package,
  Star,
  Sparkles,
} from "lucide-react";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80";

export default function PlanCard({ box, onOpenPlan }) {
  const price = box.value || 0;
  const hasDiscount = box.discountPercent > 0;

  return (
    <div
      className="group relative rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2"
      style={{
        background: "linear-gradient(145deg, #FFFAF8 0%, #FFFFFF 100%)",
        border: "1px solid #F0DDD5",
        boxShadow: "0 4px 24px rgba(44, 24, 16, 0.06)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          boxShadow:
            "inset 0 0 60px rgba(200, 92, 60, 0.02), 0 10px 30px rgba(200, 92, 60, 0.08)",
        }}
      />

      {/* Top accent */}
      <div
        className="h-[1.5px] w-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, #C85C3C, #FFF0EB, #C85C3C, transparent)",
        }}
      />

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-[#FFF5F2]">
        <Image
          fill
          src={box.images?.[0]?.url || PLACEHOLDER}
          alt={box.name || "Box"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Soft light gradient overlay at bottom of image */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(255,250,248,0.85) 0%, rgba(255,250,248,0.1) 40%, transparent 100%)",
          }}
        />

        {/* Badges */}
        {hasDiscount && (
          <span
            className="absolute top-3 left-3 text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-wider z-10 text-white shadow-sm"
            style={{ background: "#C85C3C" }}
          >
            -{box.discountPercent}%
          </span>
        )}
        {box.isGift && (
          <span
            className="absolute top-3 right-3 text-[9px] font-black px-2.5 py-1.5 rounded-full z-10 text-white shadow-sm"
            style={{
              background: "#2C1810",
              border: "1px solid #4A3028",
            }}
          >
            🎁 GIFT
          </span>
        )}

        {/* Stock indicator */}
        {box.stock > 0 && box.stock <= 5 && (
          <span
            className="absolute bottom-3 left-3 text-[9px] font-bold px-2 py-1 rounded-full z-10 animate-pulse shadow-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#dc2626",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            Chỉ còn {box.stock} hộp!
          </span>
        )}

        {/* Stars overlay at bottom */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={10}
              fill="#F59E0B"
              color="#F59E0B"
              opacity={0.9}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 relative z-10">
        {/* Name */}
        <h2
          className="font-bold text-lg leading-tight mb-1 transition-colors group-hover:text-[#C85C3C]"
          style={{ fontFamily: "Georgia, serif", color: "#2C1810" }}
        >
          {box.name}
        </h2>

        {/* Description */}
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-4"
          style={{ color: "#6B5E59" }}
        >
          {box.descriptions ||
            box.description ||
            "Hộp quà cao cấp được tuyển chọn kỹ lưỡng"}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: "#FFF0EB",
              border: "1px solid #F0DDD5",
              color: "#C85C3C",
            }}
          >
            <Package size={11} />
            {box.totalItem || box.products?.length || 0} sản phẩm
          </div>
          {box.stock > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#059669",
              }}
            >
              ✓ Còn hàng
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-5">
          {hasDiscount && (
            <p
              className="text-xs line-through mb-0.5"
              style={{ color: "#A8A29E" }}
            >
              {price.toLocaleString("vi-VN")}đ
            </p>
          )}
          <p
            className="text-2xl font-black"
            style={{ fontFamily: "Georgia, serif", color: "#C85C3C" }}
          >
            {hasDiscount
              ? (price * (1 - box.discountPercent / 100)).toLocaleString(
                  "vi-VN",
                )
              : price.toLocaleString("vi-VN")}
            đ
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "#8C7E7A" }}>
            / tháng khi đăng ký
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onOpenPlan(box)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-wide transition-all duration-300 active:scale-95 group/btn text-white"
            style={{
              background: "linear-gradient(135deg, #C85C3C, #B14B2D)",
              boxShadow: "0 4px 16px rgba(200, 92, 60, 0.2)",
            }}
          >
            <Sparkles
              size={12}
              className="transition-transform group-hover/btn:rotate-12"
            />
            Subscribe
            <CalendarDays size={12} />
          </button>

          <Link
            href={`/products/box/${box._id}`}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all duration-300 active:scale-95"
            style={{
              background: "rgba(200, 92, 60, 0.05)",
              border: "1px solid #F0DDD5",
              color: "#C85C3C",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFF0EB";
              e.currentTarget.style.borderColor = "#C85C3C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(200, 92, 60, 0.05)";
              e.currentTarget.style.borderColor = "#F0DDD5";
            }}
          >
            Xem
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="h-px opacity-40"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(200, 92, 60, 0.25), transparent)",
        }}
      />
    </div>
  );
}
