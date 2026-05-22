"use client";

import { useEffect, useState } from "react";
import { getAllBoxesApi } from "@/app/services/api/boxService";
import PlanCard from "@/app/(client)/components/Subsciber_components/PlanCard";
import ChoosePlanModal from "@/app/(client)/components/Subsciber_components/ChoosePlanModal";
import TrustBadge from "@/app/(client)/components/Subsciber_components/TrustBadges";
import Footer from "@/app/(client)/components/ui/footer";
import { Navigation } from "@/components_box/nav_box";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Newsletter } from "@/components_box/newsletter";
import { Loader2 } from "lucide-react";
import HeroSectionSub from "../../components/hero_section_page/hero_section_subscriber";

export default function SubscriberPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlanBox, setActivePlanBox] = useState(null);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        setLoading(true);
        const res = await getAllBoxesApi();
        const data = res?.data || res;

        // Normalize data
        if (Array.isArray(data)) setBoxes(data);
        else if (Array.isArray(data?.data)) setBoxes(data.data);
        else if (Array.isArray(data?.boxes)) setBoxes(data.boxes);
        else setBoxes([]);
      } catch (err) {
        console.error("Lỗi tải boxes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  return (
    <div className="min-h-screen bg-[#fff3e4] text-[#f5e6c0] selection:bg-[#d4a847] selection:text-[#1d1b1a]">
      <AnnouncementBarBox />
      <Navigation />

      <HeroSectionSub />

      <main className="relative">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-0 w-full h-125.5 bg-linear-to-b from-[#fff3e4] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto py-20 px-4 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#282520] font-bold">
              Subscription Service
            </p>
            <h1 className="text-5xl md:text-7xl font-bold font-serif bg-clip-text text-transparent bg-linear-to-b from-[#242322] to-[#24211a]">
              Subscription Boxes
            </h1>
            <p className="max-w-xl mx-auto text-[#242322] text-lg">
              Tuyển tập những hộp quà cao cấp, gửi trao tận tay bạn mỗi tháng
              với những bất ngờ được thiết kế riêng.
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#242322] animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boxes.map((box) => (
                <PlanCard
                  key={box._id}
                  box={box}
                  onOpenPlan={setActivePlanBox}
                />
              ))}
            </div>
          )}

          {/* Footer Sections */}
          <div className="mt-24 text-[#242322]">
            <TrustBadge />
            <Newsletter />
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal */}
      {activePlanBox && (
        <ChoosePlanModal
          box={activePlanBox}
          onClose={() => setActivePlanBox(null)}
        />
      )}
    </div>
  );
}
