"use client";
import { Navigation } from '@/components_box/nav_box';
import AnnouncementBarBox from '@/components_box/announcement-bar';
import ChoosePlan from '@/components_box/ChoosePlan';
import Footer from '@/app/(client)/components/ui/footer';
export default function SubscriberPage() {
  return <div className="tm-commerce tm-commerce--atelier min-h-screen bg-[#FFFAF8]">
    <AnnouncementBarBox /><Navigation />
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 max-w-3xl"><h1 className="tm-product-title">Chọn gói đăng ký hàng tháng</h1><p className="mt-4 text-stone-600">Chọn hộp và so sánh các kỳ hạn đang bán. Tổng tiền được trả trước cho cả kỳ; phí vận chuyển do khách trả riêng cho từng lần nhận.</p></header>
      <ChoosePlan embedded />
    </main><Footer />
  </div>;
}
