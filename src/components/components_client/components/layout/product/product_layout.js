import Link from "next/link";

export default function CollectionLayout({ title, linkText, linkHref, children }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        
        <div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <div className="h-1 w-16 bg-yellow-500 rounded-full"></div>
        </div>

        <Link 
          href={linkHref} 
          className="text-green-700 font-bold text-sm uppercase tracking-widest hover:text-green-800 transition-colors inline-flex items-center gap-2 group"
        >
          {linkText}
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {children}
      </div>
    </section>
  );
}
