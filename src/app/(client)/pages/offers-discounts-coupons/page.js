"use client";

import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import Layout from "../layout-page";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../../components/ui/footer";
import CartDrawer from "../../components/Cart_component/cart_drawer";
import {
  Tag,
  Copy,
  Check,
  Zap,
  Clock,
  Gift,
  Percent,
  ArrowRight,
  Star,
} from "lucide-react";

const BANNERS = [
  {
    tag: "Flash Sale",
    title: "Giảm 30% tất cả Box Gift",
    sub: "Chỉ trong hôm nay • Còn 6 giờ",
    cta: "Mua ngay",
    href: "/",
    bg: "from-amber-800 to-amber-600",
    emoji: "⚡",
  },
  {
    tag: "Thành viên mới",
    title: "Ưu đãi 150K đơn đầu tiên",
    sub: "Nhập mã HELLO150 khi thanh toán",
    cta: "Đăng ký ngay",
    href: "/",
    bg: "from-stone-800 to-stone-600",
    emoji: "🎁",
  },
];

const COUPONS = [
  {
    code: "HELLO150",
    discount: "150.000đ",
    type: "Đơn đầu tiên",
    min: "Tối thiểu 500K",
    expire: "31/12/2024",
    color: "green",
  },
  {
    code: "SUMMER20",
    discount: "20%",
    type: "Toàn bộ đơn hàng",
    min: "Tối thiểu 300K",
    expire: "30/06/2024",
    color: "blue",
  },
  {
    code: "GIFT3BOX",
    discount: "15%",
    type: "Gói Subscribe 3 tháng",
    min: "Không giới hạn",
    expire: "31/03/2024",
    color: "amber",
  },
  {
    code: "FREESHIP",
    discount: "Miễn ship",
    type: "Tất cả đơn",
    min: "Tối thiểu 200K",
    expire: "28/02/2024",
    color: "purple",
  },
  {
    code: "BDAY2024",
    discount: "25%",
    type: "Sinh nhật TotMart",
    min: "Tối thiểu 400K",
    expire: "15/03/2024",
    color: "red",
  },
  {
    code: "MAKER10",
    discount: "10%",
    type: "Sản phẩm thủ công",
    min: "Không giới hạn",
    expire: "30/04/2024",
    color: "teal",
  },
];

const OFFERS = [
  {
    icon: Star,
    title: "Thành viên Vàng",
    desc: "Tích điểm từ mỗi đơn hàng. Đạt 1000 điểm → nâng cấp Vàng, hưởng 5% cashback vĩnh viễn.",
    cta: "Tham gia",
    href: "/",
  },
  {
    icon: Gift,
    title: "Giới thiệu bạn bè",
    desc: "Nhận 100K khi bạn bè đặt đơn đầu tiên qua link của bạn. Không giới hạn số lượt.",
    cta: "Lấy link",
    href: "/",
  },
  {
    icon: Zap,
    title: "Subscribe & Save",
    desc: "Đăng ký gói hàng tháng tiết kiệm 10–20% so với mua lẻ, kèm box quà bất ngờ mỗi quý.",
    cta: "Xem gói",
    href: "/",
  },
  {
    icon: Percent,
    title: "Quà tặng doanh nghiệp",
    desc: "Giảm thêm 5–15% cho đơn từ 10 hộp trở lên. Tùy chỉnh branding miễn phí.",
    cta: "Liên hệ",
    href: "/pages/contact-us",
  },
];

const colorMap = {
  green: {
    badge: "bg-green-100 text-green-800",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  blue: {
    badge: "bg-blue-100 text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  amber: {
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  purple: {
    badge: "bg-purple-100 text-purple-800",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  red: {
    badge: "bg-red-100 text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  teal: {
    badge: "bg-teal-100 text-teal-800",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
};

function CouponCard({ coupon }) {
  const [copied, setCopied] = useState(false);
  const c = colorMap[coupon.color];

  const copy = () => {
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-2xl border-2 ${c.border} overflow-hidden hover:shadow-md transition-shadow`}
    >
      {/* Top dashed */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}
          >
            {coupon.type}
          </span>
          <div className={`w-2 h-2 rounded-full ${c.dot} mt-1`} />
        </div>
        <p className="font-serif text-3xl text-stone-900 mb-1">
          {coupon.discount}
        </p>
        <p className="text-xs text-stone-400">{coupon.min}</p>
      </div>

      {/* Dashed separator */}
      <div className="mx-5 border-t-2 border-dashed border-stone-200 my-1" />

      <div className="px-5 pb-5 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-stone-50 rounded-lg px-3 py-2 font-mono text-sm font-bold text-stone-800 tracking-widest">
            {coupon.code}
          </div>
          <button
            onClick={copy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
              ${copied ? "bg-green-100 text-green-700" : "bg-stone-900 text-white hover:bg-amber-800"}`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Đã sao chép" : "Sao chép"}
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <Clock size={12} className="text-stone-400" />
          <span className="text-xs text-stone-400">
            Hết hạn: {coupon.expire}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OffersPage() {
  return (
    <Layout>
      <Head>
        <title>Ưu đãi & Khuyến mãi – TotMart</title>
        <meta
          name="description"
          content="Tổng hợp mã giảm giá, khuyến mãi và ưu đãi hấp dẫn nhất tại TotMart. Tiết kiệm tối đa với các coupon độc quyền."
        />
      </Head>

      {/* Hero */}
      <section className="bg-[#f5f0e8] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-6">
            Khuyến mãi
          </span>
          <h1 className="font-serif text-5xl text-stone-900 mb-5 leading-tight">
            Ưu đãi & <em className="text-amber-800">tiết kiệm thật</em>
          </h1>
          <p className="text-stone-600 text-base leading-relaxed">
            Mã giảm giá, flash sale và chương trình thành viên — tất cả ở đây.
          </p>
        </div>
      </section>

      {/* Banners */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          {BANNERS.map((b) => (
            <div
              key={b.title}
              className={`bg-linear-to-r ${b.bg} rounded-2xl p-7 relative overflow-hidden`}
            >
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20">
                {b.emoji}
              </div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full mb-3">
                {b.tag}
              </span>
              <h3 className="font-serif text-2xl text-white mb-2 leading-snug">
                {b.title}
              </h3>
              <p className="text-white/70 text-sm mb-5">{b.sub}</p>
              <Link
                href={b.href}
                className="inline-flex items-center gap-2 bg-white text-stone-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-colors"
              >
                {b.cta} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Coupons */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-3xl text-stone-900">Mã giảm giá</h2>
            <p className="text-stone-500 text-sm mt-1">
              {COUPONS.length} mã đang có hiệu lực
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Tag size={14} />
            Cập nhật tự động
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COUPONS.map((c) => (
            <CouponCard key={c.code} coupon={c} />
          ))}
        </div>
      </section>

      {/* Other offers */}
      <section className="bg-[#f5f0e8] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-stone-900 mb-3">
              Ưu đãi đặc biệt
            </h2>
            <p className="text-stone-500 text-sm">
              Những cách khác để tiết kiệm và tận hưởng nhiều hơn.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OFFERS.map(({ icon: Icon, title, desc, cta, href }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-stone-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-200 transition-colors">
                  <Icon size={22} className="text-amber-800" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed mb-5">
                  {desc}
                </p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-amber-800 text-xs font-semibold hover:gap-2 transition-all"
                >
                  {cta} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email subscription */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-stone-900 rounded-3xl px-10 py-14 text-center">
          <p className="text-amber-400 text-sm font-semibold mb-3 tracking-wider uppercase">
            Nhận thêm ưu đãi
          </p>
          <h2 className="font-serif text-3xl text-white mb-4">
            Đừng bỏ lỡ flash sale bất kỳ
          </h2>
          <p className="text-stone-400 text-sm mb-8 max-w-sm mx-auto">
            Đăng ký nhận thông báo để nhận mã giảm giá độc quyền và cập nhật ưu
            đãi sớm nhất.
          </p>
          <div className="flex max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-500"
            />
            <button className="px-5 py-3 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap">
              Đăng ký
            </button>
          </div>
          <p className="text-stone-600 text-xs mt-4">
            Không spam. Hủy đăng ký bất kỳ lúc nào.
          </p>
        </div>
      </section>
    </Layout>
  );
}
