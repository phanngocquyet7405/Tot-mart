import Link from "next/link";
import { ProductCard } from "./product_card";
import CollectionLayout from "./product_layout";

export default function FeaturedProducts({
  title = "Featured Products",
  initialData = [],
}) {
  const products = initialData;

  if (!products || products.length === 0) return null;

  return (
    <CollectionLayout title={title} linkText="View All" linkHref="/products">
      {products.map((product, index) => (
        <ProductCard
          // Fallback: nếu không có id, dùng _id hoặc fallback cuối cùng là index
          key={product.id || product._id || `product-${index}`}
          product={product}
          onAddToCart={(p) => console.log("Added:", p)}
        />
      ))}
    </CollectionLayout>
  );
}
