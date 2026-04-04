import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#1a0b2e] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* 1. Giới thiệu */}
          <div>
            <h4 className="text-xl font-bold mb-6 border-b-2 border-white/20 pb-2 inline-block">
              Giới thiệu
            </h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Về chúng tôi
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Cam kết của chúng tôi
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Tin tức báo chí
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Liên hệ
              </a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 border-b-2 border-white/20 pb-2 inline-block">
              Hướng dẫn sử dụng
            </h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Mua hàng
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Bảo vệ người mua
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Thanh toán và vận chuyển
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Câu hỏi thường gặp
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Điều khoản sử dụng website
              </a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 border-b-2 border-white/20 pb-2 inline-block">
              Cùng tham gia
            </h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Đối tác phân phối
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Đại sứ hình ảnh
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Quà tặng doanh nghiệp
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Tham gia thiết kế
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#8cc63f] transition-colors flex items-center gap-2">
                <span className="text-[10px]">▶</span> Cơ hội việc làm/ tình nguyện
              </a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 border-b-2 border-white/20 pb-2 inline-block">
              Đăng ký nhận bản tin
            </h4>
            <p className="text-sm text-gray-300 mb-4 italic">
              Nhận tin giảm giá và xu hướng mới nhất
            </p>
            <div className="flex mb-8">
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                className="flex-1 px-4 py-2 text-gray-900 focus:outline-none"
              />
              <button className="bg-[#4a7c44] text-white px-4 py-2 hover:bg-[#3d6638] transition-colors">
                <span className="text-xl font-bold">+</span>
              </button>
            </div>

            <h5 className="text-sm font-bold mb-4">Chấp nhận thanh toán</h5>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white p-1 rounded-sm flex items-center justify-center h-8">
                   <div className="text-[8px] text-gray-400">Card {i}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#8cc63f] text-sm">
            © 2026 TotMart. All Rights Reserved
          </p>
          
          {/* Social Icons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            {['facebook', 'youtube', 'twitter', 'pinterest'].map((social) => (
              <a 
                key={social} 
                href="#" 
                className="w-10 h-10 bg-[#25153a] flex items-center justify-center rounded hover:bg-[#8cc63f] transition-colors group"
              >
                <div className="w-5 h-5 bg-gray-400 group-hover:bg-white rounded-sm"></div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}