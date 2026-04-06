import Image from "next/image";

export default function ProductSection({ 
  title, 
  subtitle, 
  description, 
  imageSrc, 
  reverse = false, 
  isDark = false 
}) {
  const bgColor = isDark ? 'bg-[#15202B]' : 'bg-[#F9F6F1]';
  const textColor = isDark ? 'text-white' : 'text-[#15202B]';
  const subTextColor = isDark ? 'text-green-400' : 'text-green-600'; 
  const descColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const btnClass = isDark 
    ? 'bg-white text-[#15202B] hover:bg-gray-100' 
    : 'bg-[#15202B] text-white hover:bg-[#1f2d3d]';

  return (
    <section className="w-full relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-10 w-full min-h-125 lg:min-h-162.5">
        
        <div className={`
          flex items-center justify-center p-8 md:p-12 lg:p-16 
          ${bgColor} 
          ${reverse ? 'lg:order-2 lg:col-span-4' : 'lg:order-1 lg:col-span-4'}
        `}>
          <div className="max-w-md w-full"> 
            <p className={`text-xs md:text-sm tracking-[0.3em] mb-4 uppercase font-bold ${subTextColor}`}>
              {subtitle}
            </p>
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight font-serif ${textColor}`}
            >
              {title}
            </h2>
            <p className={`${descColor} leading-relaxed mb-10 text-base md:text-lg italic`}>
              `{description}`
            </p>
            <button className={`${btnClass} px-10 py-4 transition-all duration-300 group flex items-center space-x-3 shadow-sm hover:shadow-md`}>
              <span className="tracking-wider text-sm font-bold uppercase">Khám phá ngay</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`
          relative h-100 lg:h-auto overflow-hidden 
          ${reverse ? 'lg:order-1 lg:col-span-6' : 'lg:order-2 lg:col-span-6'}
        `}>
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="60vw" 
            priority={true}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
          />
          <div className={`absolute inset-0 ${isDark ? 'bg-black/10' : 'bg-transparent'}`}></div>
        </div>

      </div>
    </section>
  );
}