"use client";
import React, { useState, useEffect, useRef, use } from "react";
import Image from "next/image";
import {
  Star,
  Heart,
  Truck,
  ShieldCheck,
  Plus,
  Check,
  Minus,
  Share2,
} from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Layout components
import MainHeader from "../../components/ui/main_header";
import NavMenu from "../../components/ui/nav_menu";
import AnnouncementBar from "../../components/ui/AnnouncementBar";
import Footer from "../../components/ui/footer";

// API Service
import { getProductByIdApi } from "@/app/services/api/productServices";

export default function ProductDetailPage({ params: paramsPromise }) {
  // Giải nén params từ Promise (Bắt buộc cho Next.js 15+)
  const params = use(paramsPromise);
  const slug = params?.slug || "";

  // Tách lấy ID từ cuối chuỗi slug (Ví dụ: "banh-quy-abc-123" -> "123")
  const productId = slug.includes("-") ? slug.split("-").pop() : slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainAddToCartRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await getProductByIdApi(productId);
        const data = res?.data || res;
        if (data) {
          setProduct(data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainAddToCartRef.current) {
        const rect = mainAddToCartRef.current.getBoundingClientRect();
        setShowStickyBar(rect.top < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateQuantity = (val) => {
    if (quantity + val >= 1) setQuantity((prev) => prev + val);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-black border-gray-200 rounded-full animate-spin"></div>
          <p className="font-bold tracking-widest text-xs uppercase">
            Loading Totmart...
          </p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">Sản phẩm không tồn tại.</p>
      </div>
    );

  const displayPrice = product.price?.toLocaleString() || "0";
  const displayOriginalPrice = product.originalPrice?.toLocaleString();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white shadow-sm z-100">
        <AnnouncementBar />
        <MainHeader />
        <NavMenu />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <nav className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-8">
          Home / {product.category?.name || "Collections"} /{" "}
          <span className="text-black font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 w-full md:w-20 overflow-x-auto md:overflow-visible">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 aspect-square w-16 md:w-full border-2 rounded-sm transition-all overflow-hidden ${
                    selectedImage === i
                      ? "border-black"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img.url || "/placeholder.svg"}
                    alt="thumb"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>

            <div className="flex-1 relative aspect-square bg-gray-50 border border-gray-100 rounded-sm overflow-hidden group">
              <Image
                src={product.images?.[selectedImage]?.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white rounded-full shadow-sm"
                >
                  <Heart className="w-5 h-5 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white rounded-full shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <Badge className="w-fit mb-4 bg-red-50 text-red-600 border-red-100 font-bold tracking-widest text-[10px]">
              BESTSELLER
            </Badge>
            <h1 className="text-4xl font-serif text-[#1e3040] mb-3 uppercase leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < (product.rating || 5) ? "fill-current" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-gray-500 underline uppercase tracking-tighter">
                Verified Reviews
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-black">
                {displayPrice}đ
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through font-light">
                  {displayOriginalPrice}đ
                </span>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Quantity
              </p>
              <div className="flex gap-4">
                <div className="flex items-center border border-gray-200 rounded-sm">
                  <button
                    onClick={() => updateQuantity(-1)}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <Button
                  ref={mainAddToCartRef}
                  className="flex-1 bg-[#1e3040] hover:bg-[#4a7c44] text-white h-auto py-4 text-xs font-bold uppercase tracking-[0.2em]"
                >
                  Add to Cart
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[11px] font-bold text-gray-600 uppercase tracking-tight">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" /> Fast Shipping
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" /> Secure
                Checkout
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Cancel Anytime
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> 100% Authentic
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-32">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 gap-8">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold uppercase text-[11px] tracking-widest p-0 h-full"
              >
                The Details
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold uppercase text-[11px] tracking-widest p-0 h-full"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="details"
              className="py-8 animate-in fade-in duration-500"
            >
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <p className="mb-6 text-base">
                  {product.description || "Không có mô tả cho sản phẩm này."}
                </p>
                <div className="mt-4 text-sm font-medium border-l-2 border-black pl-4 py-1">
                  <span className="text-gray-400 uppercase text-[10px] block">
                    Category / Brand
                  </span>
                  <span className="text-black">{product.category?.name}</span> •{" "}
                  <span className="text-black">{product.brand?.name}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="shipping"
              className="py-8 text-sm text-gray-600"
            >
              <p>
                Miễn phí giao hàng tiêu chuẩn cho đơn hàng trên 500.000đ. Đảm
                bảo giao hàng an toàn.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-110 transition-all duration-500 ease-in-out transform ${showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-sm border overflow-hidden shrink-0">
              <Image
                src={product.images?.[0]?.url || "/placeholder.svg"}
                alt="sticky"
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-[#1e3040] uppercase truncate">
                {product.name}
              </h4>
              <p className="text-[11px] font-bold text-green-600">
                {displayPrice}đ
              </p>
            </div>
          </div>
          <Button className="bg-[#1e3040] hover:bg-[#4a7c44] text-white h-10 px-6 text-[10px] font-bold uppercase tracking-widest rounded-sm">
            Add To Cart
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
