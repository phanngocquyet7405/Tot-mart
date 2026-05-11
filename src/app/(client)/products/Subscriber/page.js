"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, Zap, Shield, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Import các component mới theo yêu cầu
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../../components/ui/footer";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";

// =============================================
// DATA: Tất cả các gói subscription
// =============================================
export const SUBSCRIPTION_PLANS = [
  {
    id: "snack-box",
    slug: "snack-box",
    name: "Snack Box",
    tagline: "Hương vị Nhật Bản tại nhà bạn",
    description:
      "Hộp snack cao cấp từ Nhật Bản với 20+ loại bánh kẹo độc quyền, kèm sách hướng dẫn văn hóa 24 trang.",
    coverImage:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    accentColor: "#C85C3C",
    bgColor: "#FFF5F2",
    badge: "BESTSELLER",
    rating: 4.9,
    reviewCount: 2841,
    startingPrice: 31.99,
    plans: [
      {
        id: "12m",
        label: "12 Tháng",
        months: 12,
        price: 31.99,
        originalPrice: 39.99,
        savings: 96,
        badge: "BEST VALUE",
      },
      {
        id: "6m",
        label: "6 Tháng",
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
        label: "3 Tháng",
        months: 3,
        price: 34.99,
        originalPrice: 39.99,
        savings: 15,
      },
      { id: "1m", label: "1 Tháng", months: 1, price: 39.99 },
    ],
    features: [
      { icon: "zap", text: "20+ snack độc quyền từ Nhật" },
      { icon: "gift", text: "Sách văn hóa 20–24 trang" },
      { icon: "shield", text: "Miễn phí vận chuyển toàn quốc" },
    ],
  },
  {
    id: "beauty-box",
    slug: "beauty-box",
    name: "Beauty Box",
    tagline: "Làm đẹp chuẩn K-Beauty mỗi tháng",
    description:
      "Hộp mỹ phẩm Hàn Quốc cao cấp với 8–12 sản phẩm skincare & makeup chính hãng, được tuyển chọn bởi chuyên gia.",
    coverImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
    accentColor: "#B5478A",
    bgColor: "#FFF0F8",
    badge: "NEW",
    rating: 4.8,
    reviewCount: 1203,
    startingPrice: 28.99,
    plans: [
      {
        id: "12m",
        label: "12 Tháng",
        months: 12,
        price: 28.99,
        originalPrice: 38.99,
        savings: 120,
        badge: "BEST VALUE",
      },
      {
        id: "6m",
        label: "6 Tháng",
        months: 6,
        price: 30.99,
        originalPrice: 38.99,
        savings: 48,
        badge: "POPULAR",
        highlight: true,
      },
      { id: "1m", label: "1 Tháng", months: 1, price: 38.99 },
    ],
    features: [
      { icon: "star", text: "8–12 sản phẩm K-Beauty chính hãng" },
      { icon: "gift", text: "Skincare + Makeup mỗi tháng" },
      { icon: "shield", text: "Bảo đảm hoàn tiền 30 ngày" },
    ],
  },
  {
    id: "book-box",
    slug: "book-box",
    name: "Book Box",
    tagline: "Sách hay + Quà tặng mỗi tháng",
    description:
      "Hộp sách được tuyển chọn kỹ lưỡng kèm theo 3–5 món quà tặng chủ đề liên quan đến cuốn sách của tháng.",
    coverImage:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    accentColor: "#2C6E49",
    bgColor: "#F0FFF4",
    badge: "POPULAR",
    rating: 4.7,
    reviewCount: 987,
    startingPrice: 24.99,
    plans: [
      {
        id: "12m",
        label: "12 Tháng",
        months: 12,
        price: 24.99,
        originalPrice: 34.99,
        savings: 120,
        badge: "BEST VALUE",
      },
      {
        id: "6m",
        label: "6 Tháng",
        months: 6,
        price: 26.99,
        originalPrice: 34.99,
        savings: 48,
        badge: "POPULAR",
        highlight: true,
      },
      { id: "1m", label: "1 Tháng", months: 1, price: 34.99 },
    ],
    features: [
      { icon: "star", text: "1 cuốn sách bìa cứng cao cấp/tháng" },
      { icon: "gift", text: "3–5 món quà tặng theo chủ đề" },
      { icon: "shield", text: "Cộng đồng book club độc quyền" },
    ],
  },
];

// =============================================
// PAGE COMPONENT
// =============================================
export default function SubscriberPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Thanh thông báo trên cùng */}
      <AnnouncementBarBox />

      {/* 2. Menu điều hướng */}
      <Navigation />

      <main className="grow" style={{ background: "#FAFAF8" }}>
        {/* Hero Banner */}
        <section
          className="relative py-24 px-4 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #2C1810 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10"
            style={{
              background: "#C85C3C",
              filter: "blur(80px)",
              transform: "translate(-30%, -30%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "#B5478A",
              filter: "blur(100px)",
              transform: "translate(30%, 30%)",
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            <Badge className="mb-6 bg-white/10 text-white border border-white/20 text-xs uppercase tracking-widest px-4 py-1">
              Subscription Boxes
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-none tracking-tight">
              Chọn hộp
              <span
                className="block text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #C85C3C, #B5478A)",
                }}
              >
                của bạn
              </span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Trải nghiệm những hộp quà tuyển chọn cao cấp được giao đến tận cửa
              mỗi tháng.
            </p>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        {/* Bottom CTA & Trust Badges */}
        <section className="py-16 px-4 text-center border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Chưa chắc chắn?</p>
          <p className="text-gray-800 font-bold text-lg mb-6">
            Tất cả các gói đều có thể hủy bất cứ lúc nào. Không ràng buộc.
          </p>
          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
            {[
              "Thanh toán bảo mật",
              "Miễn phí vận chuyển",
              "Hoàn tiền 30 ngày",
              "Hỗ trợ 24/7",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1">
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* 3. Newsletter Section trước khi kết thúc main */}
        <Newsletter />
      </main>

      {/* 4. Footer ở cuối trang */}
      <Footer />
    </div>
  );
}

// =============================================
// PLAN CARD COMPONENT
// =============================================
function PlanCard({ plan }) {
  const router = useRouter();

  return (
    <div
      className="group relative rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
      onClick={() => router.push(`/products/Subscriber/${plan.slug}`)}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4 z-20">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
            style={{ background: plan.accentColor }}
          >
            {plan.badge}
          </span>
        </div>
      )}

      {/* Cover Image */}
      <div
        className="relative h-56 overflow-hidden"
        style={{ background: plan.bgColor }}
      >
        <Image
          src={plan.coverImage}
          alt={plan.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          fill
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(to top, ${plan.accentColor}, transparent)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3 fill-current"
              style={{
                color: i < Math.floor(plan.rating) ? "#FBBF24" : "#E5E7EB",
              }}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">
            {plan.rating} ({plan.reviewCount.toLocaleString()} đánh giá)
          </span>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">{plan.name}</h2>
        <p
          className="text-sm font-medium mb-3"
          style={{ color: plan.accentColor }}
        >
          {plan.tagline}
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {plan.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Từ</p>
            <p className="text-2xl font-black text-gray-900">
              ${plan.startingPrice}
              <span className="text-sm font-normal text-gray-400">/tháng</span>
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:opacity-90 hover:gap-3"
            style={{ background: plan.accentColor }}
            onClick={(e) => {
              e.stopPropagation(); // Ngăn việc kích hoạt onClick của thẻ cha
              router.push(`/products/Subscriber/${plan.slug}`);
            }}
          >
            Chọn gói <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
