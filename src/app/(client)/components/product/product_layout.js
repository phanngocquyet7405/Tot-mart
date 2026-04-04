export default function CollectionLayout({ title, linkText, linkHref, children }) {
  return (
    <section className="max-w-350 mx-auto px-4 py-12 bg-white">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-4xl md:text-5xl font-serif text-black">{title}</h2>
        <a href={linkHref} className="text-black font-semibold text-sm underline hover:text-gray-600 transition-colors">
          {linkText}
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {children}
      </div>
    </section>
  );
}