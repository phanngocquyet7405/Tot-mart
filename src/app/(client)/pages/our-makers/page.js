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


      {/* ── Story ────────────────────────────────────────────── */}


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
