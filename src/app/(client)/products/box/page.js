"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Layout components — đường dẫn đúng từ products/box/page.js
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import MainHeader from "@/app/(client)/components/ui/main_header";
import HeroSection from "@/app/(client)/components/hero_section_page/hero_section";
import FeaturedProducts from "@/app/(client)/components/layout/product/featured_products";
import Footer from "@/app/(client)/components/ui/footer";

import { getAllBoxesApi } from "@/app/services/api/boxService";
import { useCart } from "@/app/context/CartContext"; // <-- Thêm import này (Hãy điều chỉnh lại đường dẫn cho đúng với dự án của bạn)

import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Box } from "lucide-react";
import { toast } from "sonner";

export default function BoxPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // <-- Lấy hàm addToCart từ Context

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await getAllBoxesApi();
        const data = res?.data?.data || res?.data || [];
        setBoxes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi tải boxes:", err);
        toast.error("Không thể tải danh sách hộp sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  const handleAddToCart = (box) => {
    const finalPrice =
      box.discountPercent > 0
        ? box.value - (box.value * box.discountPercent) / 100
        : box.value;

    // Truyền object đúng cấu trúc để CartContext nhận diện (_id hoặc id)
    addToCart({
      _id: box._id,
      name: box.name,
      image: box.images?.[0]?.url,
      price: finalPrice,
    });

    toast.success("Đã thêm vào giỏ hàng 🛒");
  };

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      {/* Banner */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Tất cả Hộp Sản Phẩm</h1>

        {loading ? (
          <div className="py-20 text-center text-gray-500 italic">
            Đang tải hộp sản phẩm...
          </div>
        ) : boxes.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            Chưa có hộp sản phẩm nào.
          </div>
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
                  <div className="relative h-56 bg-gray-50">
                    {box.images?.[0]?.url ? (
                      <Image
                        src={box.images[0].url}
                        alt={box.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                        <Box />
                      </div>
                    )}

                    {box.discountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -{box.discountPercent}%
                      </span>
                    )}

                    {box.isGift && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Gift
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h2 className="font-semibold text-lg line-clamp-1">
                      {box.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {box.products?.length || 0} sản phẩm
                    </p>

                    {/* Price */}
                    <div className="mt-2">
                      {box.discountPercent > 0 && box.value && (
                        <span className="text-gray-400 line-through mr-2 text-sm">
                          {box.value.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                      <span className="text-red-500 font-bold">
                        {finalPrice
                          ? finalPrice.toLocaleString("vi-VN") + "đ"
                          : "Liên hệ"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {/* Thêm hiệu ứng active:scale-95 để tạo cảm giác nhấn nảy */}
                      <Button
                        size="sm"
                        className="flex-1 active:scale-95 transition-transform duration-100"
                        onClick={() => handleAddToCart(box)}
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Thêm giỏ
                      </Button>

                      <Link
                        href={`/products/box/${box._id}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full active:scale-95 transition-transform duration-100"
                        >
                          <Eye size={16} className="mr-1" />
                          Chi tiết
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
