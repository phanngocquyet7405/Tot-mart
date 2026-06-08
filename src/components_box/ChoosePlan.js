"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  BookOpen,
  Package,
  Gift,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subscriptionApi } from "@/app/services/api/subscribePlanService";
import { checkTokenValid } from "@/app/middleware/tokenMiddleware";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80";
const HARDCODED_SUB_ID = "6a1ffd616e58e8ce63d15fe3";

const iconMap = {
  package: <Package className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
};

const formatPrice = (price) => {
  return Math.round(price || 0).toLocaleString("vi-VN") + "đ";
};

const getPlanLabel = (type) => {
  switch (type) {
    case "1_month":
      return "Gói 1 Tháng";
    case "3_month":
      return "Gói 3 Tháng";
    case "6_month":
      return "Gói 6 Tháng";
    case "12_month":
      return "Gói 12 Tháng";
    default:
      return "Gói định kỳ";
  }
};

const getPlanMonths = (type) => {
  switch (type) {
    case "1_month":
      return 1;
    case "3_month":
      return 3;
    case "6_month":
      return 6;
    case "12_month":
      return 12;
    default:
      return 1;
  }
};

const DUMMY_FEATURES = [
  { icon: "package", text: "Tuyển tập sản phẩm cao cấp mỗi tháng" },
  { icon: "book", text: "Cẩm nang hướng dẫn & câu chuyện thương hiệu" },
  { icon: "gift", text: "Tặng kèm quà tặng bí mật theo từng chu kỳ" },
];

const DUMMY_DETAILS = {
  heading: "Trải Nghiệm Đẳng Cấp Tại Nhà",
  description:
    "Gói đăng ký mang đến cho bạn những trải nghiệm tuyệt vời nhất với các sản phẩm được lựa chọn kỹ lưỡng, đóng gói cẩn thận và giao tận tay bạn mỗi tháng.",
  bullets: [
    {
      bold: "Đặc quyền thành viên",
      text: "nhận ngay các hộp quà phiên bản giới hạn.",
    },
    { bold: "Sản phẩm chất lượng", text: "cam kết 100% chính hãng, an toàn." },
  ],
};

export default function ChoosePlan() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [boxInfo, setBoxInfo] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const thumbnailContainerRef = useRef(null);

  useEffect(() => {
    const fetchSubData = async () => {
      try {
        setLoading(true);
        const targetSubId = params?.id || HARDCODED_SUB_ID;

        const res = await subscriptionApi.getActive();

        let allTemplates = [];
        if (res?.data && Array.isArray(res.data.data)) {
          allTemplates = res.data.data;
        } else if (Array.isArray(res?.data)) {
          allTemplates = res.data;
        } else if (Array.isArray(res)) {
          allTemplates = res;
        }

        const mainSub = allTemplates.find(
          (t) => String(t._id) === String(targetSubId),
        );

        if (mainSub) {
          const targetBox = mainSub.boxId;
          const targetBoxId = targetBox?._id || targetBox;

          // Lọc các gói thực tế từ Database
          const dbPlans = allTemplates.filter((t) => {
            const bId = t.boxId?._id || t.boxId;
            return String(bId) === String(targetBoxId);
          });

          // --- CƠ CHẾ TỰ BÙ GÓI THIẾU ---
          // Định nghĩa danh sách 4 chu kỳ chuẩn cần phải hiển thị
          const standardTypes = ["1_month", "3_month", "6_month", "12_month"];
          const finalPlans = [];

          // Lấy các thông số cơ bản từ gói API để làm điểm tựa tính toán
          const baseValue =
            mainSub.basePrice ||
            (typeof targetBox === "object" ? targetBox.value : 111810.6);

          standardTypes.forEach((type) => {
            // Tìm xem trong Database đã có chu kỳ này chưa
            const existingPlan = dbPlans.find((p) => p.planType === type);

            if (existingPlan) {
              finalPlans.push(existingPlan);
            } else {
              // Nếu thiếu, tự sinh data ảo dựa trên giá trị của Box để không lỗi giao diện
              let discountPercent = 0;
              if (type === "3_month") discountPercent = 10;
              if (type === "6_month") discountPercent = 15;
              if (type === "12_month") discountPercent = 20;

              const mockBasePrice = baseValue * getPlanMonths(type);
              const mockDiscountPrice =
                mockBasePrice * (1 - discountPercent / 100);

              finalPlans.push({
                _id: `mock-${type}-${targetBoxId}`,
                planType: type,
                basePrice: mockBasePrice,
                discountPercent: discountPercent,
                discountPrice: mockDiscountPrice,
                gift: type === "3_month" ? mainSub.gift : [], // Kế thừa gift nếu có
                boxId: targetBox,
                isMock: true, // Đánh dấu gói ảo
              });
            }
          });

          // Sắp xếp tăng dần theo tháng
          finalPlans.sort(
            (a, b) => getPlanMonths(a.planType) - getPlanMonths(b.planType),
          );

          setBoxInfo(
            typeof targetBox === "object"
              ? targetBox
              : { _id: targetBox, name: "TestAPi", value: baseValue },
          );
          setTemplates(finalPlans);
          setSelectedPlanId(mainSub._id);
        } else {
          toast.error("Không tìm thấy thông tin gói đăng ký này!");
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Sub:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubData();
  }, [params?.id]);

  const handleScroll = (direction) => {
    if (thumbnailContainerRef.current) {
      const scrollAmount = 92;
      thumbnailContainerRef.current.scrollBy({
        top: direction === "up" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSubscribe = async () => {
    if (!checkTokenValid()) {
      toast.error("Vui lòng đăng nhập để đăng ký gói dịch vụ!");
      router.push("/login");
      return;
    }

    if (!selectedPlanId) return;

    // Ngăn chặn nếu nhấn chọn trúng gói Mock ảo chưa được cấu hình ở Database
    if (String(selectedPlanId).startsWith("mock-")) {
      toast.error(
        "Gói chu kỳ này chưa được Admin cấu hình chính thức trên hệ thống!",
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await subscriptionApi.subscribe({
        templateId: selectedPlanId,
      });
      if (response) {
        toast.success("Đăng ký gói thành công!");
        router.push("/my-subscriptions");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-[#FFFAF8]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C85C3C]" />
        <p className="mt-4 text-stone-500 font-medium animate-pulse">
          Đang nạp dữ liệu gói...
        </p>
      </div>
    );
  }

  if (!boxInfo || templates.length === 0) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-[#FFFAF8]">
        <p className="text-stone-500 font-medium">
          Không có dữ liệu cho gói này.
        </p>
      </div>
    );
  }

  const selectedPlan =
    templates.find((p) => p._id === selectedPlanId) || templates[0];
  const boxImages =
    boxInfo.images?.length > 0
      ? boxInfo.images
      : [{ url: boxInfo.image || PLACEHOLDER }];

  return (
    <section
      className="w-full py-12 md:py-20"
      style={{ background: "#FFFAF8" }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-start relative">
          {/* CỘT TRÁI: Hình Ảnh */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-28 flex gap-4">
            <div className="hidden md:flex flex-col items-center gap-2">
              {boxImages.length > 4 && (
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
                style={{ maxHeight: "356px" }}
              >
                {boxImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      idx === activeImage
                        ? "border-[#C85C3C] scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={img.url || img}
                      alt={`thumb-${idx}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {boxImages.length > 4 && (
                <button
                  onClick={() => handleScroll("down")}
                  className="p-1 hover:bg-white rounded-full shadow-sm border border-gray-200 transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-[#C85C3C]" />
                </button>
              )}
            </div>

            <div className="flex-1 relative overflow-hidden rounded-2xl shadow-xl aspect-square bg-[#FFE8E0]">
              {boxImages.map((img, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 ease-in-out",
                    idx === activeImage ? "opacity-100 z-10" : "opacity-0 z-0",
                  )}
                >
                  <Image
                    src={img.url || img}
                    alt="Box Main Image"
                    fill
                    className="object-cover"
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: Chọn gói */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            <header>
              <p className="text-xs tracking-[0.2em] uppercase text-[#C85C3C] mb-3 font-bold">
                CẤU HÌNH GÓI ĐĂNG KÝ
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight font-serif">
                {boxInfo.name || "Box Đăng Ký Định Kỳ"}
              </h2>
            </header>

            <div className="grid gap-4">
              {templates.map((plan) => {
                const isSelected = selectedPlanId === plan._id;
                const basePrice = plan.basePrice || 0;
                const finalPrice = plan.discountPrice || basePrice;
                const saveAmount = basePrice - finalPrice;

                return (
                  <div key={plan._id} className="relative">
                    <button
                      onClick={() => setSelectedPlanId(plan._id)}
                      className={cn(
                        "w-full rounded-2xl border-2 px-6 py-5 text-left transition-all",
                        isSelected
                          ? "border-[#C85C3C] bg-[#FFF0EB] shadow-md"
                          : "border-[#E8D5CC] bg-white hover:border-[#D8C5BC]",
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              isSelected
                                ? "border-[#C85C3C] bg-[#C85C3C]"
                                : "border-gray-300",
                            )}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#2C1810] text-lg block">
                              {getPlanLabel(plan.planType)}
                              {plan.isMock && (
                                <span className="text-xs text-stone-400 font-normal ml-2">
                                  (Chưa kích hoạt)
                                </span>
                              )}
                            </span>
                            {plan.discountPercent > 0 && (
                              <Badge className="mt-1 bg-[#2C1810] text-white text-[10px] uppercase tracking-tighter hover:bg-[#2C1810]">
                                TIẾT KIỆM {plan.discountPercent}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {saveAmount > 0 && (
                            <span className="text-sm text-[#C85C3C] font-bold block mb-1">
                              GIẢM {formatPrice(saveAmount)}
                            </span>
                          )}
                          <span className="text-xl font-black text-[#2C1810]">
                            {formatPrice(finalPrice)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {isSelected && plan.gift && plan.gift.length > 0 && (
                      <div className="mt-3 p-4 rounded-xl border-l-4 border-[#C85C3C] bg-white shadow-sm flex gap-4 items-center">
                        <Gift className="w-6 h-6 text-[#C85C3C] shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#2C1810]">
                            Quà tặng đính kèm gói
                          </p>
                          <p className="text-xs text-[#7A5C52] mt-0.5 font-medium">
                            {plan.gift
                              .map(
                                (g) =>
                                  `${g.boxId?.name || "Sản phẩm bí mật"} (x${g.quantity || 1})`,
                              )
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-8 rounded-3xl bg-[#2C1810] text-white flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl">
              <div className="text-center md:text-left">
                <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">
                  Thanh Toán Hôm Nay
                </p>
                <p className="text-4xl font-bold text-[#FFF0EB]">
                  {formatPrice(
                    selectedPlan.discountPrice || selectedPlan.basePrice,
                  )}
                </p>
                <p className="text-[10px] text-stone-400 mt-2 italic">
                  Giao hàng định kỳ trong {getPlanMonths(selectedPlan.planType)}{" "}
                  tháng.
                </p>
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={submitting}
                className="w-full md:w-auto bg-[#C85C3C] hover:bg-[#B14B2D] text-white px-8 py-7 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all hover:translate-y-0.5 shadow-md"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                {submitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐĂNG KÝ"}{" "}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Chân trang */}
            <div className="grid gap-4 py-8 border-y border-[#F0DDD5]">
              {DUMMY_FEATURES.map((f, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFE0D6] text-[#C85C3C] flex items-center justify-center shrink-0">
                    {iconMap[f.icon] || <Check className="w-5 h-5" />}
                  </div>
                  <p className="text-[#4A3028] font-medium">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
