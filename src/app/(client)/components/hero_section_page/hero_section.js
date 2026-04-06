import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="w-full bg-[#f8f9fa] pb-12 z-0">
      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left - Main Featured Banner (Chiếm 2/3) */}
          <div className="w-full lg:w-2/3 relative rounded-4xl overflow-hidden shadow-sm group min-h-125 lg:min-h-155 flex items-end">
            <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
              <Image 
                src="/assets/test_hero.jpg" 
                alt="Set the Table for Spring"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"></div>
            <div className="relative z-10 m-6 lg:m-10 p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 w-full md:w-4/5 text-white shadow-2xl">
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-xs tracking-widest uppercase mb-4 font-medium backdrop-blur-sm">
                Spring 26 Limited Edition
              </span>
              <h1 className="text-4xl lg:text-5xl font-light leading-tight mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Set the Table <br/> <span className="italic font-serif">for Spring</span>
              </h1>
              <p className="text-white/80 mb-8 leading-relaxed max-w-md text-sm lg:text-base">
                Embrace the beauty of sakura season with our exclusive collection of premium Japanese snacks and artisan tea sets.
              </p>
              <button className="bg-white text-gray-900 px-8 py-3.5 rounded-full hover:bg-rose-50 transition-all duration-300 shadow-lg font-medium text-sm flex items-center gap-2 group-hover:gap-4 border-none cursor-pointer">
                Explore Collection
                <svg className="w-4 h-4 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right - Sidebar Cards (Cố định độ cao bằng nhau) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            
            {/* Card 1 - Velvet Neon Nights */}
            <div className="relative flex-1 bg-gray-900 rounded-4xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group min-h-45 flex flex-col justify-between">
              <div className="absolute inset-0 bg-linear-to-br from-purple-900/80 to-pink-900/80 transition-opacity group-hover:opacity-80"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] tracking-widest text-purple-300 mb-2 uppercase font-semibold block">New Arrival</span>
                <h3 className="text-2xl text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Velvet Neon Nights</h3>
                <p className="text-sm text-gray-400 line-clamp-2">Bold flavors meet midnight elegance.</p>
              </div>
              <div className="relative z-10 mt-4">
                <Link href="#" className="text-sm text-white hover:text-purple-300 font-medium inline-flex items-center group-hover:underline underline-offset-4 transition-colors">
                  Shop Now
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

            {/* Card 2 - App Order Promo */}
            <div className="flex-1 bg-white rounded-4xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 min-h-45 flex flex-col justify-between">
              <div>
                <span className="text-[10px] tracking-widest text-indigo-600 mb-2 uppercase font-semibold block">App Exclusive</span>
                <h3 className="text-2xl text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>Get 15% Off</h3>
                <p className="text-sm text-gray-500">Download our mobile app and enjoy exclusive deals.</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">
                  Download Now
                </Link>
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
              </div>
            </div>

            {/* Card 3 - Sakura Silk Lounge */}
            <div className="relative flex-1 bg-linear-to-br from-rose-50 to-pink-100 rounded-4xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden min-h-45 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] tracking-widest text-rose-600 mb-2 uppercase font-semibold block">Special Offer</span>
                <h3 className="text-2xl text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>Sakura Lounge</h3>
                <p className="text-sm text-gray-600">Free premium gift wrapping on orders over $50.</p>
              </div>
              
              <div className="relative z-10 mt-4 flex items-center gap-3">
                <div className="bg-white/80 backdrop-blur-sm border border-dashed border-rose-300 px-4 py-2 rounded-xl flex-1 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Code:</span>
                  <span className="text-sm font-bold text-rose-600 tracking-wide">SAKURA26</span>
                </div>
                <button className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center hover:bg-rose-700 transition-colors shadow-md border-none cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}