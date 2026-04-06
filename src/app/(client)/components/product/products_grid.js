import { ProductCard } from "./product_card";

const products = [
  {
    id: 1,
    name: "Bánh Quy KitKat Matcha Nhật Bản",
    price: "120.000₫",
    originalPrice: "150.000₫",
    image: "/assets/test_product_1.jpg",
    badge: "New",
    badgeColor: "bg-blue-600",
    rating: 5,
    reviews: 12,
  },
  {
    id: 2,
    name: "Kẹo Dẻo Trái Cây Tổng Hợp",
    price: "45.000₫",
    image: "/assets/test_product_2.jpg",
    badge: "Sale",
    badgeColor: "bg-red-600",
    rating: 4,
    reviews: 85,
  },
  {
    id: 3,
    name: "Bánh Quy KitKat Matcha Nhật Bản",
    price: "120.000₫",
    originalPrice: "150.000₫",
    image: "/assets/test_product_1.jpg",
    badge: "New",
    badgeColor: "bg-yellow-600",
    rating: 5,
    reviews: 12,
  },
  {
    id: 4,
    name: "Kẹo Dẻo Trái Cây Tổng Hợp",
    price: "45.000₫",
    image: "/assets/test_product_2.jpg",
    badge: "Sale",
    badgeColor: "bg-green-600",
    rating: 4,
    reviews: 85,
  },
  {
    id: 5,
    name: "Kẹo Dẻo Trái Cây Tổng Hợp",
    price: "45.000₫",
    image: "/assets/test_product_2.jpg",
    badge: "Sale",
    badgeColor: "bg-black-600",
    rating: 4,
    reviews: 85,
  },
];

export default function ProductsGrid() {
  return (
    <div>
      <div className="flex justify-between items-center border-b pb-4">
          {/* Bên trái: Tên sản phẩm và Số lượng */}
          <div>
            <h2 className="text-xl font-bold">Tên Sản Phẩm</h2>
            <p className="text-gray-600 text-sm">Số lượng: 100 kết quả</p>
          </div>

          {/* Bên phải: Sort by và Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="font-medium">Sort by:</label>
            <select 
              id="sort" 
              className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="popular">Bán chạy nhất</option>
            </select>
          </div>
        </div>
      <br className="border-gray-500"></br>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={(p) => console.log("Thêm vào giỏ:", p.name)}
            onToggleWishlist={(p) => console.log("Yêu thích:", p.name)}
          />
        ))}
      </div>
    </div>
  );
}