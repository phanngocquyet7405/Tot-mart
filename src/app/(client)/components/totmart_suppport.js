import { useState } from 'react';
import { ChevronDown, Send } from 'lucide-react';

const faqs = [
  {
    question: 'Sản phẩm của TotMart có nguồn gốc từ đâu?',
    answer: 'Chúng tôi cam kết 100% sản phẩm được tuyển chọn từ các vùng nguyên liệu sạch, đạt chuẩn VietGAP và Organic tại Việt Nam.'
  },
  {
    question: 'Chính sách vận chuyển như thế nào?',
    answer: 'TotMart miễn phí vận chuyển cho đơn hàng từ 500.000đ trong nội thành. Đơn hàng tỉnh sẽ được giao qua đối tác vận chuyển trong 2-4 ngày.'
  },
  {
    question: 'Tôi có thể mua sỉ hoặc làm quà tặng doanh nghiệp không?',
    answer: 'Có, chúng tôi có chính sách chiết khấu hấp dẫn và thiết kế set quà riêng cho doanh nghiệp. Vui lòng liên hệ hotline để được hỗ trợ.'
  }
];

export default function TotMartSupport() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [email, setEmail] = useState('');

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-green-600 mb-4 uppercase font-bold">Hỗ trợ khách hàng</p>
            <h2 className="text-3xl lg:text-4xl text-[#15202B] font-serif">Câu Hỏi Thường Gặp</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {faqs.map((faq, index) => (
              <div key={index} className="py-2">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full py-6 flex items-center justify-between text-left transition-all"
                >
                  <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-green-600 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1c2a33] text-center text-white">
        <div className="border-b border-white/10 w-full">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-center gap-6">
          <h3 className="font-bold text-base md:text-lg text-center md:text-left">
            Đăng ký nhận bản tin và nhận ưu đãi giảm giá cho đơn hàng đầu tiên.
          </h3>
          <form 
            onSubmit={(e) => e.preventDefault()} 
            className="flex w-full md:w-auto max-w-md"
          >
            <input
              type="email"
              placeholder="Nhập địa chỉ email của bạn"
              className="flex-1 px-4 py-3 text-gray-900 focus:outline-none rounded-l-sm font-medium bg-white rounded-2xl"
              required
            />
            <button 
              type="submit" 
              className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-900 transition-colors rounded-r-sm rounded"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
      </section>
    </>
  );
}