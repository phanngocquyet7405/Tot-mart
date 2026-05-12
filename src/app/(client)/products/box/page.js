"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Layout components
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import HeroSection from "../../components/hero_section_page/hero_section";
import FeaturedProducts from "../../components/layout/product/featured_products";
import Footer from "@/app/(client)/components/ui/footer";
import CartDrawer from "@/app/(client)/components/Cart_component/cart_drawer";

// UI + icons
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";

export default function BoxPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all boxes
  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await fetch("/api/boxes");
        const data = await res.json();
        setBoxes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  // Add to cart nhanh
  const handleAddToCart = (box) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({
      boxId: box._id,
      name: box.name,
      image: box.images?.[0]?.url,
      price:
        box.discountPercent > 0
          ? box.value - (box.value * box.discountPercent) / 100
          : box.value,
      quantity: 1,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Đã thêm vào giỏ hàng 🛒");
  };

  return (
    <>
      <AnnouncementBar />
      <NavMenu />
      <MainHeader />
      <CartDrawer />

      {/* Banner */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">🎁 Tất cả Hộp Sản Phẩm</h1>

        {/* Loading */}
        {loading ? (
          <div className="text-center">Đang tải...</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {boxes.map((box) => {
              const finalPrice =
                box.discountPercent > 0
                  ? box.value - (box.value * box.discountPercent) / 100
                  : box.value;

              return (
                <div
                  key={box._id}
                  className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {/* Image */}
                  <div className="relative">
                    <Image
                      src={box.images?.[0]?.url}
                      alt={box.name}
                      width={300}
                      height={300}
                      className="w-full h-56 object-cover"
                    />

                    {/* Discount */}
                    {box.discountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -{box.discountPercent}%
                      </span>
                    )}

                    {/* Gift */}
                    {box.isGift && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        🎁 Gift
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h2 className="font-semibold text-lg line-clamp-1">
                      {box.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {box.totalItem} sản phẩm
                    </p>

                    {/* Price */}
                    <div className="mt-2">
                      {box.discountPercent > 0 && (
                        <span className="text-gray-400 line-through mr-2 text-sm">
                          {box.value.toLocaleString()}đ
                        </span>
                      )}
                      <span className="text-red-500 font-bold">
                        {finalPrice.toLocaleString()}đ
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(box)}
                      >
                        <ShoppingCart size={16} />
                      </Button>

                      <Link href={`/boxes/${box._id}`} className="flex-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                        >
                          <Eye size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FeaturedProducts />
      <Footer />
    </>
  );
}
