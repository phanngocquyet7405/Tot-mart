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
import { ChevronDown, Search, ArrowRight } from "lucide-react";

const FAQS = [
  {
    category: "Đặt hàng & Thanh toán",
    emoji: "🛒",
    items: [
      {
        q: "Làm sao để đặt hàng trên TotMart?",
        a: "Bạn có thể chọn box yêu thích, thêm vào giỏ hàng và hoàn tất thanh toán. Chúng tôi chấp nhận chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ và ví điện tử (MoMo, ZaloPay, VNPay).",
      },
      {
        q: "Tôi có thể đặt hàng theo số lượng lớn cho doanh nghiệp không?",
        a: "Hoàn toàn được! Chúng tôi có chương trình quà tặng doanh nghiệp với giá đặc biệt và logo branding tùy chỉnh. Liên hệ team@totmart.vn để được tư vấn.",
      },
      {
        q: "Giỏ hàng có được lưu lại không?",
        a: "Khi bạn đăng nhập tài khoản, giỏ hàng sẽ được lưu tự động. Với khách chưa đăng nhập, giỏ hàng giữ trong phiên trình duyệt hiện tại.",
      },
      {
        q: "Tôi có thể thay đổi hoặc hủy đơn sau khi đặt không?",
        a: "Bạn có thể hủy đơn trong 2 giờ đầu sau khi đặt. Sau đó, nếu đơn chưa được đóng gói, liên hệ hotline 1800 6868 để được hỗ trợ.",
      },
    ],
  },
  {
    category: "Vận chuyển & Giao hàng",
    emoji: "📦",
    items: [
      {
        q: "Thời gian giao hàng là bao lâu?",
        a: "Nội thành Hà Nội & TP.HCM: 1–2 ngày làm việc. Các tỉnh thành khác: 3–5 ngày làm việc. Bạn sẽ nhận được mã theo dõi đơn hàng qua email và SMS.",
      },
      {
        q: "Phí vận chuyển được tính như thế nào?",
        a: "Miễn phí vận chuyển cho đơn từ 500.000đ. Đơn dưới mức này: 30.000đ (nội thành) và 50.000đ (tỉnh thành).",
      },
      {
        q: "TotMart có giao quốc tế không?",
        a: "Hiện tại chúng tôi chỉ giao hàng trong nước. Chúng tôi đang phát triển tính năng giao quốc tế và dự kiến ra mắt cuối năm 2024.",
      },
      {
        q: "Hàng bị hư hỏng khi vận chuyển thì xử lý thế nào?",
        a: "Quay video khi mở hộp và liên hệ ngay với chúng tôi qua email hoặc hotline. Chúng tôi sẽ đổi hàng mới hoặc hoàn tiền trong 48 giờ.",
      },
    ],
  },
  {
    category: "Gói Subscribe",
    emoji: "🔄",
    items: [
      {
        q: "Gói Subscribe hoạt động như thế nào?",
        a: "Bạn đăng ký gói (1, 3, 6 hoặc 12 tháng) và hàng tháng sẽ nhận một box mới với sản phẩm được tuyển chọn theo chủ đề. Bạn được quyền skip hoặc tạm dừng bất cứ lúc nào.",
      },
      {
        q: "Tôi có thể tùy chỉnh nội dung box subscribe không?",
        a: "Gói Personalized (từ 3 tháng trở lên) cho phép bạn điền profile sở thích để chúng tôi cá nhân hóa box phù hợp hơn.",
      },
      {
        q: "Làm sao để hủy gói Subscribe?",
        a: "Vào Tài khoản → Đăng ký của tôi → Hủy gói. Nếu hủy trước ngày 20 hàng tháng, bạn sẽ không bị tính phí tháng tiếp theo.",
      },
      {
        q: "Giá gói Subscribe có ưu đãi hơn mua lẻ không?",
        a: "Có! Gói 3 tháng tiết kiệm 10%, gói 6 tháng tiết kiệm 15% và gói 12 tháng tiết kiệm 20% so với mua từng box riêng lẻ.",
      },
    ],
  },
  {
    category: "Đổi trả & Hoàn tiền",
    emoji: "↩️",
    items: [
      {
        q: "Chính sách đổi trả của TotMart là gì?",
        a: "Chúng tôi chấp nhận đổi trả trong 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi, hư hỏng hoặc không đúng mô tả. Sản phẩm cần còn nguyên vẹn và đầy đủ bao bì.",
      },
      {
        q: "Thời gian hoàn tiền là bao lâu?",
        a: "Sau khi xác nhận yêu cầu, tiền sẽ được hoàn về phương thức thanh toán gốc trong 3–7 ngày làm việc.",
      },
      {
        q: "Tôi không thích sản phẩm trong box, có đổi được không?",
        a: "Vì tính chất bí ẩn của box, chúng tôi không hỗ trợ đổi trả vì lý do sở thích. Tuy nhiên, nếu sản phẩm lỗi hoặc hết hạn, chúng tôi sẽ xử lý ngay.",
      },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border-b border-stone-100 last:border-0 transition-colors ${open ? "bg-amber-50/50" : ""}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 px-6 text-left"
      >
        <span
          className={`text-sm font-medium leading-relaxed ${open ? "text-amber-900" : "text-stone-800"}`}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-stone-400 transition-transform mt-0.5 ${open ? "rotate-180 text-amber-700" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-stone-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <Layout>
      <Head>
        <title>FAQ – Câu hỏi thường gặp – TotMart</title>
        <meta
          name="description"
          content="Giải đáp mọi thắc mắc về đặt hàng, vận chuyển, gói Subscribe và chính sách đổi trả tại TotMart."
        />
      </Head>

      {/* Hero */}
      <section className="bg-[#f5f0e8] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-6">
            Trung tâm hỗ trợ
          </span>
          <h1 className="font-serif text-5xl text-stone-900 mb-5 leading-tight">
            Câu hỏi
            <em className="text-amber-800"> thường gặp</em>
          </h1>
          <p className="text-stone-600 mb-8 text-base">
            Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-sm text-stone-800
                placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Category nav */}
          <aside className="hidden md:block">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
              Danh mục
            </p>
            <nav className="space-y-1 sticky top-24">
              {FAQS.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => {
                    setActive(cat.category);
                    document
                      .getElementById(cat.category)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-colors
                    ${active === cat.category ? "bg-amber-100 text-amber-900 font-semibold" : "text-stone-600 hover:bg-stone-100"}`}
                >
                  <span>{cat.emoji}</span>
                  <span className="leading-tight">{cat.category}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* FAQ list */}
          <div className="md:col-span-3 space-y-8">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Không tìm thấy câu hỏi phù hợp.</p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-amber-700 text-sm font-semibold hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              filtered.map((cat) => (
                <div key={cat.category} id={cat.category}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{cat.emoji}</span>
                    <h2 className="font-serif text-xl text-stone-900">
                      {cat.category}
                    </h2>
                  </div>
                  <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                    {cat.items.map((item) => (
                      <AccordionItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Still need help */}
            <div className="bg-stone-900 rounded-2xl p-8 text-center">
              <p className="font-serif text-xl text-white mb-2">
                Vẫn chưa tìm được câu trả lời?
              </p>
              <p className="text-stone-400 text-sm mb-6">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.
              </p>
              <Link
                href="/pages/contact-us"
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
              >
                Liên hệ ngay <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
