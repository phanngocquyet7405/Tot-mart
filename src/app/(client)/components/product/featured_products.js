import Link from "next/link";
import { ProductCard } from "./product_card";

export default function FeaturedProducts({ initialData = [] }) {
  // Trong tương lai, dùng: const { data, isLoading } = useQuery(['featured'], fetchFeatured)
  const products = initialData;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="text-xs tracking-widest text-gray-500 mb-2 uppercase">Handpicked Selection</p>
        <h2 className="text-4xl mb-4 font-serif">Featured Products</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our curated collection of premium artisanal goods.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/products" className="inline-block border-2 border-gray-900 px-8 py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-all">
          View All Products
        </Link>
      </div>
    </section>
  );
}