"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Sản phẩm của TotMart có nguồn gốc từ đâu?",
    answer:
      "Chúng tôi cam kết 100% sản phẩm được tuyển chọn từ các vùng nguyên liệu sạch, đạt chuẩn VietGAP và Organic tại Việt Nam.",
  },
  {
    question: "Chính sách vận chuyển như thế nào?",
    answer:
      "Khách trả phí giao hàng trực tiếp cho đơn vị vận chuyển, ngoài số tiền thanh toán cho TotMart. Mức phí cần được thống nhất trước khi giao.",
  },
  {
    question: "Tôi có thể mua sỉ hoặc làm quà tặng doanh nghiệp không?",
    answer:
      "Có, chúng tôi có chính sách chiết khấu hấp dẫn và thiết kế set quà riêng cho doanh nghiệp. Vui lòng liên hệ hotline để được hỗ trợ.",
  },
];

export default function TotMartSupport() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [email, setEmail] = useState("");

  return (
    <>
      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-primary mb-4 uppercase font-bold">
              Hỗ Trợ
            </p>
            <h2 className="text-4xl md:text-5xl text-foreground font-serif font-bold">
              Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="divide-y divide-border">
            {faqs.map((faq, index) => (
              <div key={index} className="py-2">
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full py-6 flex items-center justify-between text-left transition-all hover:text-primary"
                >
                  <span className="text-lg font-medium text-foreground font-serif">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 ml-4 transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? "max-h-40 pb-6" : "max-h-0"}`}
                >
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-card border-t border-border text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Badge */}
            <p className="text-sm font-semibold text-primary font-bold uppercase tracking-widest mb-4">
              Tham Gia Cộng Đồng
            </p>

            {/* Heading */}
            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Đăng ký nhận tin
            </h3>

            {/* Description */}
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Nhận bản tin độc quyền với các công thức nấu ăn theo mùa và ưu đãi giảm giá cho đơn hàng đầu tiên.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-3.5 bg-background text-foreground placeholder:text-muted-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3.5 rounded-xl transition-colors duration-300 whitespace-nowrap uppercase tracking-wider text-sm"
              >
                Tham Gia
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
