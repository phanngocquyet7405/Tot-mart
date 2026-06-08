"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Loader2,
  Gift,
  Sparkles,
  Package,
  Truck,
  RotateCcw,
} from "lucide-react";
import { subscriptionApi } from "@/app/services/api/subscribePlanService";

// UI Components (Đảm bảo đường dẫn import đúng với project của bạn)
import { Navigation } from "@/components_box/nav_box";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import Footer from "@/app/(client)/components/ui/footer";
import TrustBadge from "@/app/(client)/components/Subsciber_components/TrustBadges";
import { Newsletter } from "@/components_box/newsletter";

import PlanCard from "@/app/(client)/components/Subsciber_components/PlanCard";
import ChoosePlanModal from "@/app/(client)/components/Subsciber_components/ChoosePlanModal";

// --- MOCK THEMES CHO SECTION DƯỚI CÙNG (Có thể thay bằng API sau) ---
const MOCK_THEMES = [
  {
    title: "HANDPICKED IN JAPAN",
    img: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=500&q=80",
    tag: "Hot Seller",
  },
  {
    title: "SAKURA SILK LOUNGE",
    img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80",
    tag: "Spring Edition",
  },
  {
    title: "VELVET NEON NIGHTS",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=500&q=80",
    tag: "Tokyo Special",
  },
  {
    title: "HATSUYUME DREAMS",
    img: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=500&q=80",
    tag: "New Year Classic",
  },
  {
    title: "REFLECTIONS IN SNOWLIGHT",
    img: "https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=500&q=80",
    tag: "Hokkaido Winter",
  },
];

/** --- LOGIC XỬ LÝ DỮ LIỆU TỪ API --- */
function normalizePlansToBoxes(plans) {
  const boxMap = new Map();

  plans.forEach((plan) => {
    const boxRef = plan.boxId;
    if (!boxRef || typeof boxRef !== "object" || !boxRef._id) return;
    const boxId = boxRef._id;

    if (!boxMap.has(boxId)) {
      // Lưu lại thông tin Box cơ bản và lấy giá trị cơ sở của plan đầu tiên làm tham chiếu
      boxMap.set(boxId, {
        ...boxRef,
        value: plan.basePrice || boxRef.value || 0,
        discountPercent: plan.discountPercent || 0,
        apiPlans: [], // Lưu trữ tạm các plans thuộc box này
      });
    }
    // Đẩy plan vào box tương ứng
    boxMap.get(boxId).apiPlans.push(plan);
  });

  return Array.from(boxMap.values());
}

/** --- MAIN COMPONENT --- */
export default function SubscriberPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoxForModal, setSelectedBoxForModal] = useState(null);

  // Fetch dữ liệu từ API
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
        {/* Intro Header */}
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

        {/* Grid of Plan Cards (Dữ liệu thật từ API) */}
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

        {/* SECTION 2: Tính năng nổi bật */}
        <section className="bg-[#FFF5F2] rounded-3xl p-8 lg:p-12 mb-20 border border-[#F0DDD5]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C85C3C]">
              YOUR FIRST BOX INCLUDES
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-black text-[#2C1810] mt-1">
              Hộp Quà Đầu Tiên Của Bạn Gồm Những Gì?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "GIFT-WITH-PURCHASE",
                desc: "Hội viên nhận ngay bộ quà tặng độc quyền Nhật Bản giá trị cao.",
                icon: <Gift className="w-5 h-5 text-[#C85C3C]" />,
              },
              {
                title: "AUTHENTIC TREATS",
                desc: "Bánh mochi dẻo mềm, senbei giòn rụm, kẹo trái cây chính gốc.",
                icon: <Sparkles className="w-5 h-5 text-[#C85C3C]" />,
              },
              {
                title: "BOKKSU EXCLUSIVES",
                desc: "Sản phẩm độc quyền từ các thương hiệu lâu đời tại Nhật Bản.",
                icon: <Package className="w-5 h-5 text-[#C85C3C]" />,
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[#F0DDD5] hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-serif text-[13px] font-black text-[#2C1810] tracking-wider uppercase mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-[#7A645D] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Khám phá chủ đề */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C85C3C]">
              DISCOVER MONTHLY THEMES
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-black text-[#2C1810] mt-1">
              Khám Phá Các Chủ Đề Hàng Tháng
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_THEMES.map((theme, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-4/5 rounded-2xl overflow-hidden border border-[#F0DDD5] bg-stone-100 relative mb-2.5">
                  <Image
                    src={theme.img}
                    alt={theme.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 left-3 text-[8px] font-black bg-white text-[#C85C3C] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    {theme.tag}
                  </span>
                </div>
                <h4 className="font-serif text-[11px] font-black text-[#2C1810] tracking-wider text-center group-hover:text-[#C85C3C] transition-colors leading-tight">
                  {theme.title}
                </h4>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal Container: Render khi có Hộp quà được chọn */}
      {selectedBoxForModal && (
        <ChoosePlanModal
          box={selectedBoxForModal}
          plansProps={selectedBoxForModal.apiPlans} // Truyền luôn plans đã có để khỏi gọi API lại
          onClose={() => setSelectedBoxForModal(null)}
        />
      )}

      {/* FOOTER WIDGETS */}
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
