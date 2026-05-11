"use client";

import Head from "next/head";
import Link from "next/link";
import Layout from "../layout-page";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../../components/ui/footer";
import CartDrawer from "../../components/Cart_component/cart_drawer";
import { Heart, Leaf, Package, Users, ArrowRight, Star } from "lucide-react";

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
  },
  {
    icon: Leaf,
    title: "Bền vững & có trách nhiệm",
    desc: "Ưu tiên các nhà sản xuất thân thiện với môi trường, sử dụng nguyên liệu tự nhiên và bao bì tái chế được.",
  },
  {
    icon: Users,
    title: "Hỗ trợ cộng đồng",
    desc: "Kết nối trực tiếp với các làng nghề truyền thống, giúp nghệ nhân Việt có thu nhập bền vững.",
  },
  {
    icon: Package,
    title: "Trải nghiệm mở hộp",
    desc: "Thiết kế bao bì công phu, từng chi tiết nhỏ đều tạo nên sự ngạc nhiên và thích thú.",
  },
];

const TEAM = [
  { name: "Nguyễn Lan Anh", role: "Đồng sáng lập & CEO", initials: "LA" },
  { name: "Trần Minh Đức", role: "Đồng sáng lập & CPO", initials: "MD" },
  { name: "Lê Thu Hà", role: "Giám đốc Sáng tạo", initials: "TH" },
  { name: "Phạm Quốc Bảo", role: "Giám đốc Vận hành", initials: "QB" },
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f5f0e8] pt-20 pb-28">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #78350f 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-6">
            Câu chuyện của chúng tôi
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 leading-[1.1] mb-6">
            Hộp quà không chỉ là
            <br />
            <em className="text-amber-800 not-italic">một món quà</em>
          </h1>
          <p className="text-stone-600 text-lg leading-relaxed max-w-2xl mx-auto">
            TotMart ra đời từ niềm tin rằng mỗi sản phẩm thủ công đều mang trong
            mình một câu chuyện — về bàn tay người thợ, về mảnh đất quê hương,
            về tình yêu truyền thống.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 -mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-stone-100 overflow-hidden">
          {STATS.map((s) => (
            <div key={s.label} className="px-8 py-7 text-center">
              <p className="font-serif text-4xl text-amber-800 mb-1">
                {s.value}
              </p>
              <p className="text-sm text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-4xl text-stone-900 mb-6 leading-snug">
              Bắt đầu từ một
              <br />
              câu hỏi đơn giản
            </h2>
            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>
                Năm 2018, hai người bạn Lan Anh và Minh Đức tự hỏi:{" "}
                <em>Tại sao quà tặng ý nghĩa lại khó tìm đến vậy?</em> Họ muốn
                những sản phẩm thủ công Việt Nam – từ xà phòng thiên nhiên Hội
                An, trà sen Tây Hồ, đến gốm Bát Tràng – được biết đến rộng rãi
                hơn.
              </p>
              <p>
                Từ một garage nhỏ ở Hà Nội với 5 nhà sản xuất đầu tiên, TotMart
                đã lớn lên thành nền tảng kết nối hơn 120 nghệ nhân, thợ thủ
                công trên khắp cả nước với hàng chục nghìn khách hàng yêu quý.
              </p>
              <p>
                Chúng tôi không chỉ bán hàng — chúng tôi kể câu chuyện, bảo tồn
                nghề truyền thống và tạo ra những khoảnh khắc đáng nhớ qua mỗi
                chiếc hộp.
              </p>
            </div>
            <Link
              href="/pages/our-makers"
              className="inline-flex items-center gap-2 mt-8 text-amber-800 font-semibold text-sm hover:gap-3 transition-all"
            >
              Gặp gỡ các nhà sản xuất <ArrowRight size={16} />
            </Link>
          </div>

          {/* Visual block */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-linear-to-br from-amber-100 to-stone-200 flex items-center justify-center overflow-hidden">
              <div className="text-center p-10">
                <div className="text-8xl mb-4">🎁</div>
                <p className="font-serif text-xl text-stone-700 italic">
                  Mỗi hộp là một câu chuyện
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-amber-200 rounded-2xl -z-10" />
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-stone-200 rounded-xl -z-10" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-stone-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl text-white mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              Những nguyên tắc định hướng mọi quyết định của chúng tôi, từ việc
              chọn lựa nhà sản xuất đến cách đóng gói từng chiếc hộp.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-stone-800 rounded-2xl p-6 hover:bg-stone-750 transition-colors"
              >
                <div className="w-12 h-12 bg-amber-800/30 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={22} className="text-amber-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-base">
                  {title}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="font-serif text-4xl text-stone-900 mb-4">
            Đội ngũ sáng lập
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed">
            Những con người đam mê, cùng nhau xây dựng TotMart với trái tim và
            khối óc.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-linear-to-br from-amber-200 to-stone-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="font-serif text-xl text-stone-700">
                  {member.initials}
                </span>
              </div>
              <p className="font-semibold text-stone-900 text-sm">
                {member.name}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-amber-800 rounded-3xl px-10 py-14 text-center">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                fill="#fbbf24"
                className="text-amber-400"
              />
            ))}
          </div>
          <h2 className="font-serif text-3xl text-white mb-4">
            Sẵn sàng mở hộp bất ngờ?
          </h2>
          <p className="text-amber-200 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Khám phá bộ sưu tập hộp quà tinh tuyển, hoặc đăng ký gói đăng ký
            hàng tháng để nhận những điều thú vị.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-amber-900 px-7 py-3 rounded-xl font-semibold text-sm hover:bg-amber-50 transition-colors"
            >
              Khám phá ngay <ArrowRight size={15} />
            </Link>
            <Link
              href="/pages/our-makers"
              className="inline-flex items-center gap-2 border border-amber-600 text-amber-100 px-7 py-3 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors"
            >
              Gặp nhà sản xuất
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
