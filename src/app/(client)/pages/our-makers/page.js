"use client";

import Head from "next/head";
import Link from "next/link";
import Layout from "../layout-page";
import { useRouter, usePathname } from "next/navigation";
import {
  Heart,
  Leaf,
  Package,
  Users,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";

const STATS = [
  { value: "2018", label: "Năm thành lập" },
  { value: "120+", label: "Nhà sản xuất đối tác" },
  { value: "50K+", label: "Khách hàng hài lòng" },
  { value: "98%", label: "Đánh giá tích cực" },
];

const VALUES = [
  {
    icon: Heart,
    title: "Tạo ra từ tình yêu",
    desc: "Mỗi sản phẩm được chúng tôi tuyển chọn kỹ lưỡng, đảm bảo mang đến trải nghiệm thực sự ý nghĩa cho người nhận.",
    accent: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    icon: Leaf,
    title: "Bền vững & có trách nhiệm",
    desc: "Ưu tiên các nhà sản xuất thân thiện với môi trường, sử dụng nguyên liệu tự nhiên và bao bì tái chế được.",
    accent: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  {
    icon: Users,
    title: "Hỗ trợ cộng đồng",
    desc: "Kết nối trực tiếp với các làng nghề truyền thống, giúp nghệ nhân Việt có thu nhập bền vững.",
    accent: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    icon: Package,
    title: "Trải nghiệm mở hộp",
    desc: "Thiết kế bao bì công phu, từng chi tiết nhỏ đều tạo nên sự ngạc nhiên và thích thú.",
    accent: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
];

const TEAM = [
  {
    name: "Nguyễn Lan Anh",
    role: "Đồng sáng lập & CEO",
    initials: "LA",
    bg: "from-amber-200 to-amber-300",
  },
  {
    name: "Trần Minh Đức",
    role: "Đồng sáng lập & CPO",
    initials: "MD",
    bg: "from-stone-200 to-stone-300",
  },
  {
    name: "Lê Thu Hà",
    role: "Giám đốc Sáng tạo",
    initials: "TH",
    bg: "from-rose-100 to-rose-200",
  },
  {
    name: "Phạm Quốc Bảo",
    role: "Giám đốc Vận hành",
    initials: "QB",
    bg: "from-teal-100 to-teal-200",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <Head>
        <title>Về chúng tôi – TotMart</title>
        <meta
          name="description"
          content="Câu chuyện của TotMart – nơi những hộp quà tinh tuyển gặp gỡ những tâm hồn yêu nghề thủ công Việt Nam."
        />
      </Head>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] py-24 md:py-32">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #78350f 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-stone-300/30 blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-[11px] font-bold tracking-[0.22em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-7">
            Câu chuyện của chúng tôi
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-stone-900 leading-[1.08] mb-7">
            Hộp quà không chỉ là
            <br />
            <em className="text-amber-800 not-italic">một món quà</em>
          </h1>
          <p className="text-stone-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            TotMart ra đời từ niềm tin rằng mỗi sản phẩm thủ công đều mang trong
            mình một câu chuyện — về bàn tay người thợ, về mảnh đất quê hương,
            về tình yêu truyền thống.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-amber-800 text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-amber-900 transition-colors shadow-md shadow-amber-900/20"
            >
              Khám phá hộp quà <ArrowRight size={15} />
            </Link>
            <Link
              href="/pages/our-makers"
              className="inline-flex items-center gap-2 text-stone-700 border border-stone-300 bg-white/70 px-7 py-3.5 rounded-xl font-semibold text-sm hover:border-amber-400 hover:text-amber-800 transition-colors"
            >
              Thương hiệu <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-stone-200/60 border border-stone-100 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-stone-100">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="px-6 py-8 text-center group hover:bg-amber-50/50 transition-colors"
              >
                <p className="font-serif text-4xl md:text-5xl text-amber-800 mb-1.5 group-hover:scale-105 transition-transform origin-bottom">
                  {s.value}
                </p>
                <p className="text-sm text-stone-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-6">
              Nguồn gốc
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-8 leading-snug">
              Bắt đầu từ một
              <br />
              câu hỏi đơn giản
            </h2>

            {/* Pull quote */}
            <div className="relative pl-5 mb-7 border-l-2 border-amber-400">
              <Quote size={18} className="text-amber-400 mb-2" />
              <p className="text-stone-700 font-serif text-lg italic leading-relaxed">
                Tại sao quà tặng ý nghĩa lại khó tìm đến vậy?
              </p>
              <p className="text-sm text-stone-400 mt-2">
                — Lan Anh & Minh Đức, 2018
              </p>
            </div>

            <div className="space-y-4 text-stone-600 leading-relaxed text-[15px]">
              <p>
                Hai người bạn muốn những sản phẩm thủ công Việt Nam – từ xà
                phòng thiên nhiên Hội An, trà sen Tây Hồ, đến gốm Bát Tràng –
                được biết đến rộng rãi hơn.
              </p>
              <p>
                Từ một garage nhỏ ở Hà Nội với 5 nhà sản xuất đầu tiên, TotMart
                đã lớn lên thành nền tảng kết nối hơn 120 nghệ nhân trên khắp cả
                nước với hàng chục nghìn khách hàng yêu quý.
              </p>
              <p>
                Chúng tôi không chỉ bán hàng — chúng tôi kể câu chuyện, bảo tồn
                nghề truyền thống và tạo ra những khoảnh khắc đáng nhớ qua mỗi
                chiếc hộp.
              </p>
            </div>

            <Link
              href="/pages/our-makers"
              className="inline-flex items-center gap-2 mt-9 text-amber-800 font-bold text-sm border-b-2 border-amber-300 pb-0.5 hover:border-amber-600 transition-colors"
            >
              Gặp gỡ các nhà sản xuất <ArrowRight size={14} />
            </Link>
          </div>

          {/* Visual */}
          <div className="relative">
            {/* Main card */}
            <div className="aspect-square rounded-3xl bg-linear-to-br from-amber-100 via-amber-50 to-stone-200 flex flex-col items-center justify-center overflow-hidden shadow-xl shadow-stone-200/60 border border-stone-100">
              <div className="text-center p-10">
                <div className="text-[80px] mb-5 select-none">🎁</div>
                <p className="font-serif text-xl text-stone-700 italic mb-2">
                  Mỗi hộp là một câu chuyện
                </p>
                <p className="text-sm text-stone-400">— TotMart</p>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-stone-100 px-4 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg">
                🏺
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-800">
                  Gốm Bát Tràng
                </p>
                <p className="text-[10px] text-stone-400">600 năm lịch sử</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-stone-100 px-4 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-lg">
                🌸
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-800">
                  Trà sen Hồ Tây
                </p>
                <p className="text-[10px] text-stone-400">
                  Truyền thống Hà Nội
                </p>
              </div>
            </div>
            {/* bg decor */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-200/60 rounded-2xl -z-10" />
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-stone-200/80 rounded-xl -z-10" />
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────── */}
      <section className="bg-stone-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400 bg-amber-900/40 px-3 py-1 rounded-full mb-5">
              Triết lý
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-5">
              Giá trị cốt lõi
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto leading-relaxed">
              Những nguyên tắc định hướng mọi quyết định của chúng tôi, từ việc
              chọn lựa nhà sản xuất đến cách đóng gói từng chiếc hộp.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
              <div
                key={title}
                className="bg-stone-800/60 border border-stone-700/50 rounded-2xl p-6 hover:bg-stone-800 hover:-translate-y-1 transition-all duration-200"
              >
                <div
                  className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-5`}
                >
                  <Icon size={20} className={iconColor} />
                </div>
                <h3 className="font-semibold text-white mb-2.5 text-[15px] leading-snug">
                  {title}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-5">
            Con người
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
            Đội ngũ sáng lập
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed">
            Những con người đam mê, cùng nhau xây dựng TotMart với trái tim và
            khối óc.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center group cursor-default">
              <div
                className={`w-20 h-20 mx-auto rounded-2xl bg-linear-to-br ${member.bg} flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200`}
              >
                <span className="font-serif text-xl text-stone-700">
                  {member.initials}
                </span>
              </div>
              <p className="font-semibold text-stone-900 text-sm">
                {member.name}
              </p>
              <p className="text-xs text-stone-400 mt-1 leading-snug">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden bg-amber-800 rounded-3xl px-8 md:px-14 py-14 text-center">
          {/* Bg texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative">
            <div className="flex justify-center gap-0.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill="#fbbf24"
                  className="text-amber-400"
                />
              ))}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-snug">
              Sẵn sàng mở hộp bất ngờ?
            </h2>
            <p className="text-amber-200/90 mb-9 max-w-md mx-auto text-[15px] leading-relaxed">
              Khám phá bộ sưu tập hộp quà tinh tuyển, hoặc đăng ký gói hàng
              tháng để nhận những điều thú vị.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white text-amber-900 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors shadow-lg shadow-amber-900/20"
              >
                Khám phá ngay <ArrowRight size={14} />
              </Link>
              <Link
                href="/pages/our-makers"
                className="inline-flex items-center justify-center gap-2 border border-amber-600/60 text-amber-100 bg-amber-900/30 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-amber-700/50 transition-colors"
              >
                Gặp nhà sản xuất
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
