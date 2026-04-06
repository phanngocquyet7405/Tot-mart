export default function CollectionLayout({ title, linkText, linkHref, children }) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-16 bg-white">
      
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-10 gap-4">
        
        <h2 className="text-3xl md:text-5xl font-serif text-black uppercase tracking-tight">
          {title}
        </h2>

        <a 
          href={linkHref} 
          className="text-black font-bold text-xs uppercase tracking-widest underline decoration-1 underline-offset-8 hover:text-gray-500 transition-all"
        >
          {linkText}
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {children}
      </div>
    </section>
  );
}