"use client";

import Head from "next/head";
import { useState } from "react";
import Layout from "../layout-page";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../../components/ui/footer";
import CartDrawer from "../../components/Cart_component/cart_drawer";
import {
  Shield,
  RotateCcw,
  Truck,
  FileText,
  Lock,
  ChevronDown,
} from "lucide-react";

const POLICIES = [
  {
    id: "shipping",
    icon: Truck,
    title: "Chính sách vận chuyển",
    badge: "Cập nhật 01/2024",
    content: [
      {
        heading: "Phạm vi giao hàng",
        body: "TotMart giao hàng toàn quốc 63 tỉnh thành. Hiện chưa hỗ trợ giao quốc tế.",
      },
      {
        heading: "Thời gian giao hàng",
        body: "Nội thành Hà Nội và TP.HCM: 1–2 ngày làm việc. Các tỉnh thành còn lại: 3–5 ngày làm việc. Đảo và vùng sâu vùng xa: 5–7 ngày làm việc.",
      },
      {
        heading: "Phí vận chuyển",
        body: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên. Đơn hàng dưới 500.000đ: phí 30.000đ (nội thành) và 50.000đ (tỉnh ngoài).",
      },
      {
        heading: "Theo dõi đơn hàng",
        body: "Sau khi đơn hàng được xác nhận, bạn sẽ nhận mã vận đơn qua email và SMS để theo dõi lộ trình vận chuyển theo thời gian thực.",
      },
    ],
  },
  {
    id: "return",
    icon: RotateCcw,
    title: "Chính sách đổi trả",
    badge: "Cập nhật 01/2024",
    content: [
      {
        heading: "Điều kiện đổi trả",
        body: "Sản phẩm có thể đổi trả trong 7 ngày kể từ ngày nhận hàng nếu: bị hư hỏng do vận chuyển, sản phẩm lỗi từ nhà sản xuất, hoặc không đúng với mô tả trên website.",
      },
      {
        heading: "Sản phẩm không được đổi trả",
        body: "Sản phẩm đã được mở seal/sử dụng; thực phẩm, mỹ phẩm đã mở nắp; sản phẩm bị hỏng do người dùng; hàng mua theo chương trình sale đặc biệt.",
      },
      {
        heading: "Quy trình đổi trả",
        body: "Liên hệ hỗ trợ qua email hoặc hotline kèm hình ảnh/video sản phẩm lỗi. Nhân viên sẽ xác nhận và cung cấp địa chỉ gửi trả. Sau khi nhận hàng trả, chúng tôi gửi hàng mới hoặc hoàn tiền trong 3–5 ngày.",
      },
      {
        heading: "Chi phí đổi trả",
        body: "TotMart chịu toàn bộ phí vận chuyển đổi trả nếu lỗi thuộc về chúng tôi. Trường hợp khách hàng muốn đổi vì lý do cá nhân, phí vận chuyển do khách hàng thanh toán.",
      },
    ],
  },
  {
    id: "privacy",
    icon: Lock,
    title: "Chính sách bảo mật",
    badge: "GDPR & PDPA",
    content: [
      {
        heading: "Thu thập dữ liệu",
        body: "Chúng tôi thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, email, số điện thoại, địa chỉ giao hàng. Chúng tôi cũng thu thập dữ liệu hành vi duyệt web để cải thiện trải nghiệm người dùng.",
      },
      {
        heading: "Sử dụng dữ liệu",
        body: "Dữ liệu được dùng để: xử lý đơn hàng, giao tiếp với khách hàng, cải thiện sản phẩm/dịch vụ, và gửi thông tin khuyến mãi (nếu bạn đã đồng ý).",
      },
      {
        heading: "Chia sẻ dữ liệu",
        body: "Chúng tôi KHÔNG bán dữ liệu cá nhân của bạn. Dữ liệu chỉ được chia sẻ với đối tác vận chuyển và cổng thanh toán để thực hiện đơn hàng.",
      },
      {
        heading: "Quyền của bạn",
        body: "Bạn có quyền truy cập, chỉnh sửa, hoặc xóa dữ liệu cá nhân bất kỳ lúc nào. Liên hệ privacy@totmart.vn để thực hiện yêu cầu.",
      },
    ],
  },
  {
    id: "terms",
    icon: FileText,
    title: "Điều khoản sử dụng",
    badge: "Phiên bản 3.1",
    content: [
      {
        heading: "Điều kiện sử dụng dịch vụ",
        body: "Bằng cách truy cập và sử dụng TotMart, bạn đồng ý tuân thủ các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.",
      },
      {
        heading: "Tài khoản người dùng",
        body: "Bạn chịu trách nhiệm bảo mật thông tin tài khoản. Mỗi người dùng chỉ được có một tài khoản. Tài khoản vi phạm có thể bị tạm khóa hoặc xóa vĩnh viễn.",
      },
      {
        heading: "Nội dung và đánh giá",
        body: "Bình luận, đánh giá của bạn phải trung thực và không vi phạm pháp luật. Chúng tôi có quyền xóa nội dung vi phạm quy tắc cộng đồng mà không cần thông báo trước.",
      },
      {
        heading: "Giới hạn trách nhiệm",
        body: "TotMart không chịu trách nhiệm về thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ. Trách nhiệm tối đa của chúng tôi giới hạn ở giá trị đơn hàng liên quan.",
      },
    ],
  },
  {
    id: "authenticity",
    icon: Shield,
    title: "Cam kết chất lượng",
    badge: "100% xác thực",
    content: [
      {
        heading: "Cam kết hàng chính hãng",
        body: "100% sản phẩm trên TotMart được kiểm duyệt trực tiếp từ nhà sản xuất hoặc thương hiệu chính thức. Chúng tôi không kinh doanh hàng giả, hàng nhái.",
      },
      {
        heading: "Quy trình kiểm định",
        body: "Mỗi đối tác nhà sản xuất phải trải qua quy trình kiểm định nghiêm ngặt: xác minh pháp lý, kiểm tra chất lượng sản phẩm mẫu, và đánh giá tiêu chuẩn bền vững.",
      },
      {
        heading: "Chứng nhận",
        body: "TotMart là đối tác được chứng nhận bởi các tổ chức: Fair Trade Vietnam, Organic Vietnam, và Craft Villages Association.",
      },
    ],
  },
];

function PolicySection({ policy }) {
  const [open, setOpen] = useState(false);
  const Icon = policy.icon;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all ${open ? "border-amber-200 shadow-sm" : "border-stone-100"}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${open ? "bg-amber-100" : "bg-stone-100"}`}
          >
            <Icon
              size={20}
              className={open ? "text-amber-800" : "text-stone-500"}
            />
          </div>
          <div>
            <p className="font-semibold text-stone-900 text-base">
              {policy.title}
            </p>
            <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full mt-1 inline-block">
              {policy.badge}
            </span>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-stone-400 shrink-0 transition-transform ${open ? "rotate-180 text-amber-700" : ""}`}
        />
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-stone-100">
          <div className="pt-5 space-y-5">
            {policy.content.map((section) => (
              <div key={section.heading}>
                <h4 className="font-semibold text-stone-800 text-sm mb-2">
                  {section.heading}
                </h4>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InformationPage() {
  return (
    <Layout>
      <Head>
        <title>Thông tin & Chính sách – TotMart</title>
        <meta
          name="description"
          content="Tìm hiểu về chính sách vận chuyển, đổi trả, bảo mật và điều khoản sử dụng của TotMart."
        />
      </Head>

      {/* Hero */}
      <section className="bg-[#f5f0e8] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-6">
            Chính sách
          </span>
          <h1 className="font-serif text-5xl text-stone-900 mb-5 leading-tight">
            Minh bạch & <em className="text-amber-800">đáng tin cậy</em>
          </h1>
          <p className="text-stone-600 text-base leading-relaxed max-w-xl mx-auto">
            Chúng tôi tin vào sự minh bạch. Dưới đây là toàn bộ các chính sách
            và điều khoản để bạn mua sắm an tâm.
          </p>
        </div>
      </section>

      {/* Quick nav pills */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {POLICIES.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600 hover:border-amber-300 hover:text-amber-800 transition-colors"
            >
              <p.icon size={13} />
              {p.title}
            </a>
          ))}
        </div>
      </section>

      {/* Policies */}
      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-4">
        {POLICIES.map((policy) => (
          <div key={policy.id} id={policy.id}>
            <PolicySection policy={policy} />
          </div>
        ))}

        {/* Trust badges */}
        <div className="mt-8 bg-stone-900 rounded-2xl p-8">
          <p className="text-center text-stone-400 text-xs uppercase tracking-widest mb-6">
            Được bảo hộ bởi
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              "🔒 SSL Secured",
              "💳 PCI DSS",
              "🛡️ Fair Trade Vietnam",
              "🌿 Organic Certified",
            ].map((b) => (
              <span key={b} className="text-stone-300 text-sm font-medium">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
