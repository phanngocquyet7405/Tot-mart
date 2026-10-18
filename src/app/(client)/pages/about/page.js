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


      {/* Story */}


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


      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-amber-800 rounded-3xl px-10 py-14 text-center">

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
