"use client";

import Image from "next/image";
import { ArrowUpRight, Package, Star, Sparkles } from "lucide-react";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80";

export default function PlanCard({ box, onOpenPlan, isFirst = false }) {
  // Lấy giá trị cơ bản của box (từ API trả về)
  const price = box.value || 0;

  // Hình ảnh từ object box
  const coverImage = box.images?.[0]?.url || box.image || PLACEHOLDER;

  return (
    <div
      onClick={() => onOpenPlan(box)}
      className="group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 bg-[#FFFAF8] border border-[#F0DDD5]"
      style={{
        boxShadow: isFirst
          ? "0 20px 40px rgba(200,92,60,0.12)"
          : "0 8px 24px rgba(44,24,16,0.04)",
      }}
    >
      {/* Decorative Golden Top Line */}
      <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-[#C85C3C] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Premium Badge if isFirst */}
      {isFirst && (
        <span className="absolute top-4 left-4 z-10 text-[9px] font-black uppercase tracking-widest text-white bg-[#C85C3C] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
          <Sparkles size={10} className="fill-white" /> Khuyên dùng
        </span>
      )}

      {/* Image Container with Custom Gradients */}
      <div className="relative h-64 overflow-hidden bg-[#FFF5F2]">
        <Image
          src={coverImage}
          alt={box.name || "Box"}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Soft shadow inside the image container to integrate with content below */}
        <div className="absolute inset-0 bg-linear-to-t from-[#FFFAF8] via-transparent to-black/10 pointer-events-none" />

        {/* Stock warning */}
        {box.stock > 0 && box.stock <= 5 && (
          <span className="absolute bottom-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-50 text-[#dc2626] border border-red-100 flex items-center gap-1.5 z-10 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            Chỉ còn {box.stock} hộp cuối!
          </span>
        )}

        {/* Rating Stars Overlay */}
        <div className="absolute bottom-4 right-4 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg border border-[#F0DDD5] shadow-sm z-10">
          <span className="text-[10px] font-bold text-[#2C1810] mr-1">5.0</span>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill="#C85C3C" color="#C85C3C" />
          ))}
        </div>
      </div>

      {/* Box Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-xl font-bold leading-tight mb-2 text-[#2C1810] group-hover:text-[#C85C3C] transition-colors line-clamp-1">
          {box.name || "Premium Snack Box"}
        </h3>

        <p className="text-xs leading-relaxed text-[#7A645D] line-clamp-2 mb-5 min-h-9">
          {box.descriptions ||
            box.description ||
            "Trải nghiệm văn hóa ẩm thực Nhật Bản cao cấp với bánh kẹo, trà đặc sản chính gốc được chọn lọc thủ công."}
        </p>

        {/* Feature Pill Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-[#FFF0EB] text-[#C85C3C] border border-[#F0DDD5]">
            <Package size={11} />
            {box.totalItem || 20}+ sản phẩm
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            ✓ Free Ship toàn quốc
          </span>
        </div>

        {/* Price & CTA section inside Card */}
        <div className="pt-4 border-t border-[#F5E6E0] flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#A08880] block font-bold mb-0.5">
              Chỉ từ
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-black text-[#C85C3C]">
                {price.toLocaleString("vi-VN")}đ
              </span>
              <span className="text-[10px] text-[#A08880] font-semibold">
                /tháng
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPlan(box);
            }}
            className="flex items-center gap-1.5 bg-[#C85C3C] text-white px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-[#B14B2D] hover:shadow-lg hover:shadow-[#C85C3C]/20 transition-all active:scale-95"
          >
            Chọn gói
            <ArrowUpRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
