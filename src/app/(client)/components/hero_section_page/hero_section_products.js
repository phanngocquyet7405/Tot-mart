export default function HeroSectionProduct() {
  return (
    <div className="relative bg-gradient-to-br from-green-50 via-white to-yellow-50 rounded-lg overflow-hidden mb-8 p-8 md:p-12 border border-green-100">
      <div className="relative z-10 max-w-3xl">
        <div className="inline-block px-4 py-1.5 bg-green-100/80 rounded-full text-xs font-semibold text-green-700 mb-4 uppercase tracking-wider">
          Premium Organic Selection
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-4 leading-tight">
          Discover Premium Organic Snacks
        </h1>

        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          Explore our meticulously curated collection of organic snacks, crafted
          with care and sourced from sustainable, ethical producers worldwide.
        </p>

        <button className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition-all hover:shadow-lg hover:scale-105">
          Explore Collection
        </button>
      </div>
    </div>
  );
}
