import Image from "next/image";
import Link from "next/link";

export default function ProductSection({ 
  title, 
  subtitle, 
  description, 
  imageSrc, 
  reverse = false, 
  isDark = false 
}) {
  const bgColor = isDark ? 'bg-green-900' : 'bg-gray-50';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-yellow-300' : 'text-yellow-600'; 
  const descColor = isDark ? 'text-gray-100' : 'text-gray-700';
  const btnClass = isDark 
    ? 'bg-green-600 text-white hover:bg-green-700' 
    : 'bg-green-700 text-white hover:bg-green-800';

  return (
    <section className="w-full relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen md:min-h-96">
        
        {/* Text Content */}
        <div className={`
          flex items-center justify-center p-8 md:p-12 lg:p-16 
          ${bgColor} 
          ${reverse ? 'lg:order-2' : 'lg:order-1'}
        `}>
          <div className="max-w-md w-full"> 
            <p className={`text-xs md:text-sm tracking-widest mb-4 uppercase font-bold ${subTextColor}`}>
              {subtitle}
            </p>
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight font-serif font-bold ${textColor}`}
            >
              {title}
            </h2>
            <p className={`${descColor} leading-relaxed mb-10 text-base md:text-lg`}>
              {description}
            </p>
            <Link
              href="/products"
              className={`${btnClass} px-8 py-3.5 transition-all duration-300 group inline-flex items-center gap-3 rounded-lg font-bold uppercase text-sm tracking-wider`}
            >
              <span>Shop Now</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className={`
          relative min-h-64 lg:min-h-full overflow-hidden 
          ${reverse ? 'lg:order-1' : 'lg:order-2'}
        `}>
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw" 
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
          />
        </div>

      </div>
    </section>
  );
}
