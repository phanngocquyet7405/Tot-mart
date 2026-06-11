"use client";

import { useEffect, useState } from "react";
import { Loader2, Gift } from "lucide-react";
import { subscriptionApi } from "@/app/services/api/subscribePlanService";

// Layout Components
import { Navigation } from "@/components_box/nav_box";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import Footer from "@/app/(client)/components/ui/footer";
import { Newsletter } from "@/components_box/newsletter";

// Subscriber Components
import TrustBadge from "@/app/(client)/components/Subsciber_components/TrustBadges";
import PlanCard from "@/app/(client)/components/Subsciber_components/PlanCard";
import ChoosePlanModal from "@/app/(client)/components/Subsciber_components/ChoosePlanModal";
import { MonthlyThemes } from "@/app/(client)/components/Subsciber_components/MonthlyThemes";
import { SubscriptionShowcase } from "@/components_box/product-showcase";

/** --- LOGIC XỬ LÝ DỮ LIỆU TỪ API --- */
function normalizePlansToBoxes(plans) {
  const boxMap = new Map();

  plans.forEach((plan) => {
    const boxRef = plan.boxId;
    if (!boxRef || typeof boxRef !== "object" || !boxRef._id) return;
    const boxId = boxRef._id;

    if (!boxMap.has(boxId)) {
      boxMap.set(boxId, {
        ...boxRef,
        value: plan.basePrice || boxRef.value || 0,
        discountPercent: plan.discountPercent || 0,
        apiPlans: [],
      });
    }
    boxMap.get(boxId).apiPlans.push(plan);
  });

  return Array.from(boxMap.values());
}

/** --- MAIN COMPONENT --- */
export default function SubscriberPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoxForModal, setSelectedBoxForModal] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await subscriptionApi.getActive();
        const raw = res?.data ?? res;
        let allPlans = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : [];

        const uniqueBoxes = normalizePlansToBoxes(allPlans);
        setBoxes(uniqueBoxes);
      } catch (err) {
        console.error("Lỗi tải dữ liệu gói đăng ký:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAF8]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#C85C3C] animate-spin" />
          <p className="text-sm text-stone-500 font-medium animate-pulse">
            Đang chuẩn bị hộp quà của bạn...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF8] text-[#2C1810] font-sans selection:bg-[#C85C3C]/20">
      <AnnouncementBarBox />
      <Navigation />

      {/* Cam banner thông báo */}
      <div className="bg-[#C85C3C] text-white text-center py-2.5 px-4 text-[12px] font-bold tracking-wide shadow-sm flex items-center justify-center gap-2">
        <Gift size={16} className="animate-bounce" />
        Đăng ký gói 3, 6, 12 tháng ngay hôm nay để nhận quà tặng giới hạn độc
        quyền!
      </div>

      <main className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* ── Intro Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C85C3C] bg-[#FFF5F2] border border-[#F0DDD5] px-3.5 py-1.5 rounded-full inline-block mb-4 shadow-sm">
            Premium Subscription Experience
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C1810] leading-tight">
            Chọn Hộp Quà Thành Viên Của Bạn
          </h1>
          <p className="text-sm text-[#7A645D] mt-4 leading-relaxed max-w-2xl mx-auto">
            Các gói đăng ký thành viên giúp mang tinh hoa của những nghệ nhân
            lâu đời Nhật Bản tới tận cửa nhà bạn mỗi tháng. Vui lòng chọn một
            hộp quà bên dưới để bắt đầu hành trình.
          </p>
        </div>

        {/* ── Grid of Plan Cards ── */}
        {boxes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#F0DDD5]">
            <p className="text-stone-500">
              Hiện tại chưa có gói đăng ký nào được kích hoạt.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {boxes.map((box, index) => (
              <PlanCard
                key={box._id}
                box={box}
                onOpenPlan={(b) => setSelectedBoxForModal(b)}
                isFirst={index === 0}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── SECTION: Product Showcase (full-width, outside max-w container) ── */}
      <SubscriptionShowcase />

      <main className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* ── SECTION: Monthly Themes Carousel ── */}
        <MonthlyThemes />
      </main>

      {/* Modal Container */}
      {selectedBoxForModal && (
        <ChoosePlanModal
          box={selectedBoxForModal}
          plansProps={selectedBoxForModal.apiPlans}
          onClose={() => setSelectedBoxForModal(null)}
        />
      )}

      {/* ── FOOTER WIDGETS ── */}
      <div className="bg-white border-t border-[#F0DDD5] pt-12">
        <div className="max-w-300 mx-auto px-4">
          <TrustBadge />
          <div className="my-12">
            <Newsletter />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
