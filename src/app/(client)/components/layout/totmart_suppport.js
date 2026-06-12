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
      "TotMart miễn phí vận chuyển cho đơn hàng từ 500.000đ trong nội thành. Đơn hàng tỉnh sẽ được giao qua đối tác vận chuyển trong 2-4 ngày.",
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-yellow-600 mb-4 uppercase font-bold">
              Hỗ Trợ
            </p>
            <h2 className="text-4xl md:text-5xl text-gray-900 font-serif font-bold">
              Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="py-2">
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full py-6 flex items-center justify-between text-left transition-all hover:text-green-700"
                >
                  <span className="text-lg font-medium text-gray-800 font-serif">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-green-600 flex-shrink-0 ml-4 transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? "max-h-40 pb-6" : "max-h-0"}`}
                >
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-green-900 to-green-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Badge */}
            <p className="text-sm font-semibold text-yellow-300 uppercase tracking-widest mb-4">
              Tham Gia Cộng Đồng
            </p>

            {/* Heading */}
            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Đăng ký nhận tin
            </h3>

            {/* Description */}
            <p className="text-green-100 mb-8 text-lg leading-relaxed">
              Nhận bản tin độc quyền với các công thức nấu ăn theo mùa và ưu đãi giảm giá cho đơn hàng đầu tiên.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-3.5 bg-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-white/30 backdrop-blur-sm"
                required
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-3.5 rounded-lg transition-colors duration-300 whitespace-nowrap uppercase tracking-wider text-sm"
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
