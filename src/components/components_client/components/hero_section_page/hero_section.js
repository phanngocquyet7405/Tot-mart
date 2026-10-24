import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="w-full bg-white">
      {/* Main Hero Banner */}
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden group">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/h1.png"
            alt="Năng lượng từ thiên nhiên"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
            priority
          />
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-start">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="max-w-2xl">
              {/* Label */}
              <p className="text-sm font-semibold text-yellow-300 uppercase tracking-widest mb-4">
                Lựa Chọn Cao Cấp
              </p>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                Năng lượng từ
                <br />
                <span className="italic font-light">thiên nhiên</span>
              </h1>

              {/* Description */}
              <p className="text-gray-100 text-lg mb-8 max-w-xl leading-relaxed">
                Khám phá bộ sưu tập các sản phẩm hữu cơ chất lượng cao, được tuyển chọn cẩn thận từ các nhà sản xuất bền vững trên toàn thế giới.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="px-8 py-3.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  Mua Ngay
                  <svg
                    className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                <Link
                  href="/categories"
                  className="px-8 py-3.5 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm border border-white/30"
                >
                  Tìm Hiểu Thêm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
