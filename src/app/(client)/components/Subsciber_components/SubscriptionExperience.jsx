"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Coffee,
  Cookie,
  Palette,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Gift,
  Star,
} from "lucide-react";
import AnnouncementBar from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import Footer from "@/app/(client)/components/ui/footer";
import ChoosePlan from "@/components_box/ChoosePlan";

const INSIDE_ITEMS = [
  {
    icon: Coffee,
    title: "Trà & Thức uống thảo mộc",
    desc: "Trà Shan tuyết cổ thụ, trà hoa vàng Ba Chẽ, cacao hữu cơ Tây Nguyên tuyển chọn từ các vùng nguyên liệu trứ danh.",
  },
  {
    icon: Cookie,
    title: "Bánh mứt & Đồ ăn vặt dinh dưỡng",
    desc: "Chế biến thủ công theo công thức gia truyền, không chất bảo quản, giữ trọn vị thanh tao và độ ngọt tự nhiên.",
  },
  {
    icon: Palette,
    title: "Đồ thủ công mỹ nghệ độc bản",
    desc: "Vật phẩm gốm sứ men lam, mây tre đan tinh xảo, thổ cẩm dệt tay do chính các nghệ nhân làng nghề chế tác.",
  },
  {
    icon: BookOpen,
    title: "Cẩm nang văn hóa & Nghệ nhân",
    desc: "Tập sách nhỏ kể câu chuyện đời nghề, văn hóa bản địa của từng món quà và gợi ý thưởng trà ẩm thực đúng điệu.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Chọn hộp & Kỳ hạn yêu thích",
    desc: "Lựa chọn gói đăng ký 1, 3, 6 hoặc 12 tháng. Kỳ hạn dài hơn giúp bạn tiết kiệm chi phí bình quân mỗi tháng tối đa.",
    icon: Calendar,
  },
  {
    num: "02",
    title: "TotMart chuẩn bị & Đóng gói thủ công",
    desc: "Mỗi hộp quà được chăm chút tỉ mỉ bằng giấy dó, hộp mộc tự nhiên và ruy băng vải thô, đượm phong vị văn hóa Việt.",
    icon: Gift,
  },
  {
    num: "03",
    title: "Mở hộp bất ngờ & Thưởng thức tại nhà",
    desc: "Nhận hộp quà định kỳ mỗi tháng ngay trước thềm nhà, mở ra hành trình khám phá mỹ vị và câu chuyện làng nghề cùng người thân.",
    icon: Sparkles,
  },
];

const THEMES = [
  {
    season: "Mùa Thu - Tháng 8 & 9",
    title: "Trăng Rằm & Hương Cốm Bản",
    tag: "Chủ đề hiện tại",
    desc: "Trà hoa cúc tiến vua, cốm non sấy mộc, bánh nướng nhân hạt sen cổ truyền và tách gốm men rạn mộc mạc.",
    image: "/assets/hero_section_picture.jpg",
  },
  {
    season: "Mùa Đông - Tháng 10 & 11",
    title: "Hơi Ấm Lò Củi Cao Nguyên",
    tag: "Sắp ra mắt",
    desc: "Mật ong hoa rừng nguyên sáp, trà gừng sấy lạnh, bánh hạt dinh dưỡng Mộc Châu và khăn choàng len dệt tay.",
    image: "/assets/hero_section_picture.jpg",
  },
  {
    season: "Mùa Xuân - Tháng 12 & 1",
    title: "Xuân Thì Tây Bắc",
    tag: "Bộ sưu tập Tết",
    desc: "Trà Shan tuyết ngậm sương, ô mai mận tam hoa, rượu mơ thủ công và bao lì xì giấy dó in họa tiết dân gian.",
    image: "/assets/hero_section_picture.jpg",
  },
];

const FAQS = [
  {
    q: "Gói đăng ký định kỳ (Subscription) của TotMart hoạt động thế nào?",
    a: "TotMart Subscription là hình thức hộp quà văn hóa gửi định kỳ mỗi tháng một lần. Bạn trả trước toàn bộ kỳ hạn đăng ký (1, 3, 6 hoặc 12 tháng). Mỗi tháng, TotMart sẽ tuyển chọn các sản phẩm theo chủ đề mùa và gửi hộp quà bất ngờ đến tận nhà bạn.",
  },
  {
    q: "Phí vận chuyển cho từng lần nhận hộp được tính như thế nào?",
    a: "Để đảm bảo tính minh bạch, phí vận chuyển được tính riêng theo địa chỉ thực tế khi đơn vị giao hàng chuyển từng hộp tới bạn, giúp bạn không phải trả cước cố định bị đội giá.",
  },
  {
    q: "Tôi có thể thay đổi địa chỉ nhận hàng giữa các tháng không?",
    a: "Hoàn toàn được! Bạn chỉ cần vào trang Quản lý gói đăng ký trong tài khoản hoặc liên hệ hỗ trợ TotMart trước ngày gửi hàng định kỳ 5 ngày để cập nhật địa chỉ mới.",
  },
  {
    q: "Nếu một sản phẩm trong hộp bị hư hỏng do vận chuyển thì sao?",
    a: "TotMart cam kết 100% đổi mới ngay lập tức không phụ phí nếu bất kỳ sản phẩm nào có dấu hiệu bị móp vỡ hoặc hư hỏng trong quá trình vận chuyển.",
  },
];

export default function SubscriptionExperience() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="tm-commerce tm-commerce--atelier min-h-screen bg-background text-foreground">
      <AnnouncementBar />
      <Navigation />

      <main className="pt-[100px]">
        {/* ─── 1. HERO SECTION (BOKKSU SUBSCRIPTION SIGNATURE) ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/70 via-background to-background dark:from-stone-900/40 dark:to-background border-b border-border/80 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Cột trái: Thông điệp văn hoá & CTA */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest shadow-2xs">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Hộp Quà Văn Hoá Định Kỳ Mỗi Tháng</span>
                </div>

                <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1.15]">
                  Khám phá tinh hoa thủ công & nông sản Việt mỗi tháng
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Mỗi chiếc hộp là một câu chuyện văn hoá được gói ghém tỉ mỉ từ bàn tay nghệ nhân và hợp tác xã bản địa, mang trọn phong vị quê hương đến ngôi nhà bạn.
                </p>

                {/* Rating trust banner */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-amber-500 bg-card border border-border/70 px-3.5 py-1.5 rounded-full shadow-2xs">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-foreground">4.9/5</span>
                    <span className="text-xs text-muted-foreground">(2.500+ thành viên)</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-success-text" />
                    Hủy hoặc tạm dừng linh hoạt
                  </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                  <a
                    href="#choose-plan"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Chọn gói nhận hộp ngay</span>
                    <ArrowRight size={16} />
                  </a>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground border border-border font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    Tìm hiểu cách hoạt động
                  </a>
                </div>
              </div>

              {/* Cột phải: Hình ảnh hộp quà unboxing thị giác */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-border/80 shadow-2xl bg-stone-50 dark:bg-stone-900 group">
                  <Image
                    src="/assets/hero_section_picture.jpg"
                    alt="Hộp quà TotMart Subscription"
                    fill
                    priority
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating badge */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-background/90 backdrop-blur-md border border-border/80 shadow-lg text-left">
                    <p className="text-[11px] font-black uppercase tracking-wider text-primary">Hộp Tháng Này</p>
                    <p className="text-sm font-bold text-foreground">Hương Sắc Thu & Mỹ Vị Trà Hoa</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tuyển chọn 6-8 sản vật thủ công & bánh mứt dinh dưỡng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. WHAT'S INSIDE THE BOX (MỖI HỘP CÓ GÌ?) ─── */}
        <section className="py-16 sm:py-24 bg-card border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">
                Trải nghiệm trọn vẹn
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground">
                Bên trong mỗi chiếc hộp TotMart có gì?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Chúng tôi không chỉ gửi đặc sản, mà trao gửi một hành trình khám phá văn hóa đa giác quan được tuyển chọn từ những vùng đất giàu bản sắc nhất.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {INSIDE_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border border-border/80 bg-background/80 hover:border-primary/50 transition-all duration-300 hover:shadow-md flex flex-col items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 3. HOW IT WORKS (HÀNH TRÌNH 3 BƯỚC) ─── */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-background border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">
                Đơn giản & Tiện lợi
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground">
                Hành trình 3 bước nhận hộp quà định kỳ
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Chỉ vài bước đơn giản để đón nhận những bất ngờ ngọt ngào từ làng nghề Việt mỗi tháng.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="relative p-7 rounded-3xl border border-border/80 bg-card hover:shadow-lg transition-all duration-300 flex flex-col gap-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-3xl font-black text-primary/30 group-hover:text-primary transition-colors">
                        {s.num}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Icon size={18} />
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-foreground">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 4. CHOOSE YOUR PLAN (KHU VỰC CHỌN GÓI) ─── */}
        <section id="choose-plan" className="py-16 sm:py-24 bg-gradient-to-b from-stone-50/60 via-background to-background dark:from-stone-900/30 dark:to-background border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">
                Các gói đăng ký hiện có
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-foreground">
                Chọn hộp quà và so sánh kỳ hạn
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Đăng ký dài hạn để nhận mức giá bình quân mỗi tháng ưu đãi nhất. Bạn có thể tạm dừng hoặc quản lý kỳ nhận bất kỳ lúc nào.
              </p>
            </div>

            {/* Gọi trực tiếp ChoosePlan nhúng logic mua hàng */}
            <div className="mt-8">
              <ChoosePlan embedded />
            </div>
          </div>
        </section>

        {/* ─── 5. SEASONAL THEMES PREVIEW ─── */}
        <section className="py-16 sm:py-24 bg-card border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">
                Theo dòng 4 mùa Việt Nam
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground">
                Chủ đề các mùa trong năm
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Mỗi mùa trong năm, TotMart mang đến một chủ đề riêng biệt hòa quyện cùng thiên nhiên và các lễ hội truyền thống.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {THEMES.map((theme, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-border/80 bg-background overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-muted">
                    <Image
                      src={theme.image}
                      alt={theme.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {theme.tag}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">
                        {theme.season}
                      </p>
                      <h3 className="font-serif font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {theme.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                        {theme.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. TRUST & FAQS ─── */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">
                Giải đáp thắc mắc
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground">
                Những câu hỏi thường gặp
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-2xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Trust highlights banner */}
            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/70">
                <Truck size={24} className="text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">Giao hàng bảo đảm</p>
                  <p className="text-[11px] text-muted-foreground">Đóng gói thủ công cẩn trọng</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/70">
                <ShieldCheck size={24} className="text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">100% Nguyên bản</p>
                  <p className="text-[11px] text-muted-foreground">Nông sản sạch & Làng nghề gốc</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/70">
                <HeartHandshake size={24} className="text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">Đồng hành nghệ nhân</p>
                  <p className="text-[11px] text-muted-foreground">Gìn giữ di sản văn hóa Việt</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
