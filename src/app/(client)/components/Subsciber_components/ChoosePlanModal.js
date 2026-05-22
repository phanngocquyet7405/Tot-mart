"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  X,
  Package,
  Tag,
  CalendarDays,
  BadgeCheck,
  Gift,
  BookOpen,
  Truck,
  RotateCcw,
  Shield,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPlanApi } from "@/app/services/api/subscribePlanService";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80";

const SUBSCRIBE_PLANS = [
  {
    id: "12m",
    label: "12 Tháng",
    months: 12,
    planType: "12_month",
    totalDeliveries: 12,
    discountPercent: 20,
    badge: "TIẾT KIỆM NHẤT",
  },
  {
    id: "6m",
    label: "6 Tháng",
    months: 6,
    planType: "6_month",
    totalDeliveries: 6,
    discountPercent: 15,
    badge: "PHỔ BIẾN",
    highlight: true,
  },
  {
    id: "3m",
    label: "3 Tháng",
    months: 3,
    planType: "3_month",
    totalDeliveries: 3,
    discountPercent: 10,
  },
  {
    id: "1m",
    label: "1 Tháng",
    months: 1,
    planType: "1_month",
    totalDeliveries: 1,
    discountPercent: 0,
  },
];

const PLAN_MAP = Object.fromEntries(SUBSCRIBE_PLANS.map((p) => [p.id, p]));

const FEATURES = [
  { icon: "package", text: "Sản phẩm tuyển chọn cao cấp mỗi tháng" },
  { icon: "book", text: "Hướng dẫn sử dụng & câu chuyện sản phẩm" },
  { icon: "gift", text: "Quà tặng bất ngờ theo mùa" },
];

const iconMap = {
  package: <Package className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
};

const formatCurrency = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );

function calculatePlanPrice(basePrice, planId) {
  const plan = PLAN_MAP[planId];
  if (!plan) return { monthlyPrice: basePrice, total: basePrice, save: 0 };
  const discount = plan.discountPercent / 100;
  const monthlyPrice = basePrice * (1 - discount);
  const total = monthlyPrice * plan.months;
  const save = basePrice * plan.months - total;
  return { monthlyPrice, total, save };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChoosePlanModal({ box, onClose }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("6m");
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const thumbnailRef = useRef(null);

  const images =
    box.images?.filter((i) => i?.url).length > 0
      ? box.images
      : [{ url: PLACEHOLDER, id: "ph" }];

  const basePrice = box.value || 0;
  const selected = PLAN_MAP[selectedPlan];
  const pricing = calculatePlanPrice(basePrice, selectedPlan);

  // Escape key
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const scroll = (dir) => {
    thumbnailRef.current?.scrollBy({
      top: dir === "up" ? -92 : 92,
      behavior: "smooth",
    });
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user?._id) {
        toast.error("Vui lòng đăng nhập trước");
        router.push("/login");
        return;
      }
      const payload = {
        userId: user._id,
        boxId: box._id,
        planType: selected.planType,
        totalDeliveries: selected.totalDeliveries,
        discountPercent: selected.discountPercent,
      };
      const res = await createPlanApi(payload);
      if (res?.data?.success || res?.success) {
        toast.success("Đăng ký thành công!");
        onClose();
        router.push("/profile");
      } else {
        toast.error("Đăng ký thất bại, vui lòng thử lại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tạo gói đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Shell */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl bg-[#FFFAF8] border border-[#F0DDD5]">
        {/* Soft orange top accent line */}
        <div
          className="h-1 w-full shrink-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C85C3C, #F0DDD5, #C85C3C, transparent)",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/80 border border-stone-200 flex items-center justify-center text-stone-500 hover:text-[#C85C3C] hover:bg-white transition-all active:scale-90 shadow-sm"
        >
          <X size={15} />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── LEFT: Gallery ── */}
            <div className="w-full lg:w-[42%] lg:sticky lg:top-0 flex gap-3">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="hidden md:flex flex-col items-center gap-2">
                  {images.length > 4 && (
                    <button
                      onClick={() => scroll("up")}
                      className="p-1 rounded-full border border-[#E8D5CC] bg-white text-[#C85C3C] hover:bg-[#FFF0EB] shadow-sm transition"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  <div
                    ref={thumbnailRef}
                    className="flex flex-col gap-2 overflow-y-hidden scroll-smooth"
                    style={{ maxHeight: 340 }}
                  >
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={cn(
                          "shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                          idx === activeImage
                            ? "border-[#C85C3C] scale-105 shadow-md"
                            : "border-transparent opacity-60 hover:opacity-100",
                        )}
                      >
                        <Image
                          src={img.url}
                          alt=""
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  {images.length > 4 && (
                    <button
                      onClick={() => scroll("down")}
                      className="p-1 rounded-full border border-[#E8D5CC] bg-white text-[#C85C3C] hover:bg-[#FFF0EB] shadow-sm transition"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative aspect-square rounded-2xl overflow-hidden bg-[#FFF5F2] border border-[#F0DDD5] shadow-sm">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      idx === activeImage
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0",
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={box.name}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                      sizes="40vw"
                    />
                  </div>
                ))}
                {box.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 z-20 text-[10px] bg-red-600 text-white font-black px-2.5 py-1 rounded-full shadow-md">
                    SALE {box.discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* ── RIGHT: Plan selector ── */}
            <div className="w-full lg:w-[58%] flex flex-col gap-5">
              {/* Header */}
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-2 text-[#C85C3C]">
                  ✦ CHỌN GÓI ĐĂNG KÝ
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-2 font-serif text-[#2C1810]">
                  {box.name}
                </h2>
                {(box.descriptions || box.description) && (
                  <p className="text-sm leading-relaxed line-clamp-2 text-stone-500">
                    {box.descriptions || box.description}
                  </p>
                )}
              </div>

              {/* Quick info pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  {
                    icon: <Package size={12} />,
                    text: `${box.totalItem || box.products?.length || 0} sản phẩm`,
                  },
                  {
                    icon: <Tag size={12} />,
                    text: `Giá gốc: ${formatCurrency(basePrice)}`,
                  },
                  {
                    icon: <CalendarDays size={12} />,
                    text: box.validTo
                      ? new Date(box.validTo).toLocaleDateString("vi-VN")
                      : "Không giới hạn",
                  },
                  {
                    icon: <BadgeCheck size={12} />,
                    text: box.stock > 0 ? `Còn ${box.stock} hộp` : "Hết hàng",
                    ok: box.stock > 0,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#F0DDD5] shadow-sm"
                  >
                    <span
                      style={{
                        color: item.ok === false ? "#ef4444" : "#C85C3C",
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-stone-600 font-medium">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Plan options */}
              <div className="flex flex-col gap-2">
                {SUBSCRIBE_PLANS.map((plan) => {
                  const result = calculatePlanPrice(basePrice, plan.id);
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        "w-full rounded-2xl px-5 py-4 text-left transition-all duration-200 relative overflow-hidden",
                        isSelected
                          ? "border-2 border-[#C85C3C] bg-[#FFF0EB] shadow-md"
                          : "border-2 border-[#E8D5CC] bg-white hover:border-[#D8C5BC]",
                      )}
                    >
                      <div className="flex items-center justify-between pl-1">
                        <div className="flex items-center gap-3">
                          {/* Radio */}
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "border-[#C85C3C] bg-[#C85C3C]"
                                : "border-gray-300",
                            )}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>

                          <div>
                            <span className="font-bold text-sm text-[#2C1810]">
                              {plan.label}
                            </span>
                            {plan.badge && (
                              <span className="ml-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-widest bg-[#C85C3C] text-white">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          {plan.discountPercent > 0 && (
                            <span className="text-[10px] font-bold block mb-0.5 text-[#C85C3C]">
                              -{plan.discountPercent}% · tiết kiệm{" "}
                              {formatCurrency(result.save)}
                            </span>
                          )}
                          <span className="text-base font-black text-[#2C1810]">
                            {formatCurrency(result.monthlyPrice)}
                            <span className="text-xs font-normal text-stone-400">
                              /tháng
                            </span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Checkout bar */}
              <div className="rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#2C1810] text-white shadow-xl">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-1 text-stone-400">
                    Tổng thanh toán hôm nay
                  </p>
                  <p className="text-3xl font-black font-serif text-[#FFF0EB]">
                    {formatCurrency(pricing.total)}
                  </p>
                  <p className="text-[9px] mt-1 italic text-stone-400">
                    Thanh toán mỗi {selected.months} tháng · Hủy bất cứ lúc nào
                  </p>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={loading || box.stock === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide bg-[#C85C3C] hover:bg-[#B14B2D] text-white shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                  {!loading && <ChevronRight size={15} />}
                </button>
              </div>

              {/* Features */}
              <div className="grid gap-2 pt-2 border-t border-[#F0DDD5]">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#FFE0D6] text-[#C85C3C]">
                      {iconMap[f.icon] || <Check size={12} />}
                    </div>
                    <p className="text-sm text-[#4A3028] font-medium">
                      {f.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { icon: <Truck size={12} />, label: "Miễn phí ship" },
                  { icon: <RotateCcw size={12} />, label: "Đổi trả 7 ngày" },
                  { icon: <Shield size={12} />, label: "Bảo mật 100%" },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center bg-white border border-[#F0DDD5] shadow-sm"
                  >
                    <span className="text-[#C85C3C]">{p.icon}</span>
                    <span className="font-semibold text-stone-700">
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px shrink-0 bg-linear-to-r from-transparent via-[#F0DDD5] to-transparent" />
      </div>
    </div>
  );
}
