"use client";

import { useState, useId } from "react";
import Link from "next/link";
import Layout from "../layout-page";
import { ChevronDown, Search, ArrowRight, RotateCcw } from "lucide-react";

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
        a: "Khách trả phí ship trực tiếp cho bên giao hàng. TotMart không thu khoản này trong COD/chuyển khoản; mức phí cần được thống nhất trước mỗi lần giao.",
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

function AccordionItem({ q, a, idPrefix }) {
  const [open, setOpen] = useState(false);
  const buttonId = `${idPrefix}-btn`;
  const panelId = `${idPrefix}-panel`;

  return (
    <div
      className={`border-b border-border last:border-0 transition-colors ${
        open ? "bg-muted/30" : ""
      }`}
    >
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 px-6 text-left min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <span
          className={`text-sm font-medium leading-relaxed ${
            open ? "text-primary font-semibold" : "text-foreground"
          }`}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform mt-0.5 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="px-6 pb-5 pt-1"
        >
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[65ch]">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FaqPageClient() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const baseId = useId();

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
      {/* Hero */}
      <section className="bg-card/60 border-b border-border py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
            Trung tâm hỗ trợ
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-5 leading-tight tracking-tight">
            Câu hỏi
            <em className="text-primary italic"> thường gặp</em>
          </h1>
          <p className="text-muted-foreground mb-8 text-base">
            Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm kiếm câu hỏi"
              className="w-full min-h-11 pl-12 pr-4 py-3 rounded-2xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Category nav */}
          <aside className="hidden md:block">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Danh mục
            </p>
            <nav className="space-y-1 sticky top-24">
              {FAQS.map((cat) => {
                const isSelected = active === cat.category;
                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => {
                      setActive(cat.category);
                      document
                        .getElementById(cat.category)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className={`w-full min-h-11 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="leading-tight">{cat.category}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* FAQ list */}
          <div className="md:col-span-3 space-y-8">
            {filtered.length === 0 ? (
              /* Empty state */
              <div className="text-center py-16 px-6 bg-card border border-border rounded-2xl">
                <Search
                  size={36}
                  className="mx-auto mb-3 text-muted-foreground/50"
                />
                <p className="text-sm text-muted-foreground mb-4">
                  Không tìm thấy câu hỏi phù hợp.
                </p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="min-h-11 inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-xl transition-colors hover:underline"
                >
                  <RotateCcw size={14} />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            ) : (
              /* Ready state */
              filtered.map((cat, cIdx) => (
                <div
                  key={cat.category}
                  id={cat.category}
                  className="scroll-mt-28"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{cat.emoji}</span>
                    <h2 className="font-serif text-xl text-foreground font-medium">
                      {cat.category}
                    </h2>
                  </div>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
                    {cat.items.map((item, iIdx) => (
                      <AccordionItem
                        key={item.q}
                        q={item.q}
                        a={item.a}
                        idPrefix={`${baseId}-faq-${cIdx}-${iIdx}`}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Still need help CTA */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xs">
              <p className="font-serif text-xl text-foreground mb-2">
                Vẫn chưa tìm được câu trả lời?
              </p>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto leading-relaxed">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.
              </p>
              <Link
                href="/pages/contact-us"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-11"
              >
                <span>Liên hệ ngay</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
