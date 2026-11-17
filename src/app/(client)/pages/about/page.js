"use client";

import Link from "next/link";
import Layout from "../layout-page";
import { Heart, Leaf, Package, Users, ArrowRight } from "lucide-react";

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
      <title>Về chúng tôi – TotMart</title>
      <meta
        name="description"
        content="Câu chuyện của TotMart – nơi những hộp quà tinh tuyển gặp gỡ những tâm hồn yêu nghề thủ công Việt Nam."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-card/60 border-b border-border py-16 sm:py-24">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
            Câu chuyện của chúng tôi
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight tracking-tight mb-6">
            Hộp quà không chỉ là
            <br />
            <em className="text-primary not-italic font-serif">một món quà</em>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            TotMart ra đời từ niềm tin rằng mỗi sản phẩm thủ công đều mang trong
            mình một câu chuyện — về bàn tay người thợ, về mảnh đất quê hương,
            về tình yêu truyền thống.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Những nguyên tắc định hướng mọi quyết định của chúng tôi, từ việc
              chọn lựa nhà sản xuất đến cách đóng gói từng chiếc hộp.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-6 transition-all hover:border-primary/40 shadow-xs"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 sm:p-12 text-center shadow-md">
          <h2 className="font-serif text-3xl sm:text-4xl mb-4 leading-tight">
            Sẵn sàng mở hộp bất ngờ?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Khám phá bộ sưu tập hộp quà tinh tuyển, hoặc đăng ký gói đăng ký
            hàng tháng để nhận những điều thú vị.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-7 py-3 rounded-xl font-semibold text-sm transition-colors min-h-11"
            >
              Khám phá ngay <ArrowRight size={15} />
            </Link>
            <Link
              href="/pages/our-makers"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-7 py-3 rounded-xl font-semibold text-sm transition-colors min-h-11"
            >
              Gặp nhà sản xuất
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
