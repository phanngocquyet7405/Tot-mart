"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

// UI Components
import NavMenu from "../components/ui/nav_menu";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import HeroSection from "../components/ui/hero_section";
import FeaturedProducts from "../components/layout/product/featured_products";
import Footer from "../components/ui/footer";
import CartDrawer from "@/app/(client)/components/Cart_component/cart_drawer";

// Icons
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RefreshCw,
  Package,
} from "lucide-react";

// shadcn
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BoxDetailPage() {
  const { id } = useParams();

  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchBox = async () => {
      try {
        const res = await fetch(`/api/boxes/${id}`);
        const data = await res.json();
        setBox(data);
        setSelectedImage(data?.images?.[0]?.url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBox();
  }, [id]);

  // Price calc
  const getFinalPrice = () => {
    if (!box) return 0;
    if (box.discountPercent > 0) {
      return box.value - (box.value * box.discountPercent) / 100;
    }
    return box.value;
  };

  // Quantity handlers
  const increaseQty = () => {
    if (quantity < box.stock) setQuantity(quantity + 1);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  // Add to cart
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({
      boxId: box._id,
      name: box.name,
      image: box.images?.[0]?.url,
      price: getFinalPrice(),
      quantity,
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    toast.success("Đã thêm vào giỏ hàng 🛒");
  };

  if (loading) {
    return <div className="p-10 text-center text-lg">Đang tải dữ liệu...</div>;
  }

  if (!box) {
    return <div className="p-10 text-center">Không tìm thấy Box</div>;
  }

  return (
    <>
      <AnnouncementBar />
      <NavMenu />
      <MainHeader />
      <CartDrawer />
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* LEFT - IMAGE */}
          <div>
            <div className="relative border rounded-xl overflow-hidden shadow-md">
              <Image
                src={selectedImage}
                alt="box"
                width={500}
                height={500}
                className="w-full h-100 object-cover"
              />

              {box.discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-sm rounded">
                  -{box.discountPercent}%
                </span>
              )}

              {box.isGift && (
                <span className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 text-sm rounded">
                  Gift
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-4">
              {box.images?.map((img, i) => (
                <Image
                  alt=""
                  key={i}
                  src={img.url}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                    selectedImage === img.url
                      ? "border-black"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedImage(img.url)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT - INFO */}
          <div>
            <h1 className="text-3xl font-bold mb-3">{box.name}</h1>

            {/* Price */}
            <div className="mb-4">
              {box.discountPercent > 0 && (
                <span className="text-gray-400 line-through mr-3">
                  {box.value.toLocaleString()}đ
                </span>
              )}
              <span className="text-2xl text-red-500 font-bold">
                {getFinalPrice().toLocaleString()}đ
              </span>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <p>{box.totalItem} sản phẩm</p>
              <p>
                🏷 Tình trạng:{" "}
                {box.stock > 0 ? (
                  <span className="text-green-600">Còn hàng</span>
                ) : (
                  <span className="text-red-500">Hết hàng</span>
                )}
              </p>
              <p>
                {new Date(box.validFrom).toLocaleDateString()} -{" "}
                {new Date(box.validTo).toLocaleDateString()}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mt-6">
              <Button variant="outline" onClick={decreaseQty}>
                <Minus size={16} />
              </Button>
              <span>{quantity}</span>
              <Button variant="outline" onClick={increaseQty}>
                <Plus size={16} />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button onClick={handleAddToCart}>
                <ShoppingCart className="mr-2" size={16} />
                Thêm vào giỏ
              </Button>

              <Button variant="secondary">
                <Heart size={16} />
              </Button>

              <Button variant="secondary">
                <Share2 size={16} />
              </Button>
            </div>

            {/* Policies */}
            <div className="mt-8 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Truck size={16} /> Free ship toàn quốc
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} /> Bảo hành đảm bảo
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={16} /> Đổi trả 7 ngày
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">Mô tả</h2>
          <p className={`text-gray-600 ${showFullDesc ? "" : "line-clamp-3"}`}>
            {box.descriptions}
          </p>
          <button
            className="text-blue-500 mt-2"
            onClick={() => setShowFullDesc(!showFullDesc)}
          >
            {showFullDesc ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>

        {/* Product list */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Sản phẩm trong hộp</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {box.products?.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border p-3 rounded-xl shadow-sm"
              >
                <Package size={20} />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">x{p.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FeaturedProducts />
      <Footer />
    </>
  );
}
