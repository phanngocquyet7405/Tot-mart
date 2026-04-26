"use client";
import React, { useState, useEffect, useRef, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  Truck,
  ShieldCheck,
  Plus,
  Check,
  Minus,
  Share2,
  ShoppingCart,
  Zap,
  ArrowRight,
  RotateCcw,
  Info,
} from "lucide-react";

// Shadcn UI (Giả định đã cài đặt)
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Layout & API
import MainHeader from "../../components/ui/main_header";
import NavMenu from "../../components/ui/nav_menu";
import AnnouncementBar from "../../components/ui/AnnouncementBar";
import Footer from "../../components/ui/footer";
import {
  getProductByIdApi,
  getProductsByCategoryApi,
} from "@/app/services/api/productServices";

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slug = params?.slug || "";
  const productId = slug.includes("-") ? slug.split("-").pop() : slug;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [brandProducts, setBrandProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainAddToCartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await getProductByIdApi(productId);
        const currentProduct = res?.data || res;
        setProduct(currentProduct);

        if (currentProduct?.category?._id) {
          const relatedRes = await getProductsByCategoryApi(
            currentProduct.category._id,
          );
          const allRelated = (
            relatedRes?.data?.data ||
            relatedRes?.data ||
            []
          ).filter((p) => (p._id || p.id) !== productId);

          setRelatedProducts(allRelated.slice(0, 5));
          setBrandProducts(allRelated.slice(5, 10)); // Giả lập dữ liệu cùng hãng
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  if (loading) return <LoadingSkeleton />;
  if (!product) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <AnnouncementBar />
        <MainHeader />
        <NavMenu />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] text-gray-500 mb-8 overflow-hidden whitespace-nowrap">
          <Link
            href="/homepage"
            className="hover:text-orange-600 transition-colors"
          >
            Trang chủ
          </Link>

          <span className="text-gray-300">/</span>

          {/* Chỉnh sửa href ở đây để quay lại category */}
          <Link
            href={`/category/${product.category?.slug || product.category?._id}`}
            className="hover:text-orange-600 transition-colors"
          >
            {product.category?.name || "Danh mục"}
          </Link>

          <span className="text-gray-300">/</span>

          <span className="text-gray-900 font-medium truncate">
            {product.name}
          </span>
        </nav>

        {/* SECTION 1: MAIN PRODUCT INFO */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Cột trái: Hình ảnh */}
            <div className="lg:col-span-5 p-6 border-r border-gray-50">
              <div className="sticky top-32">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 group">
                  <Image
                    src={
                      product.images?.[selectedImage]?.url || "/placeholder.svg"
                    }
                    alt={product.name}
                    fill
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images?.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative shrink-0 w-20 h-20 border-2 rounded-lg transition-all overflow-hidden ${
                        selectedImage === i
                          ? "border-orange-500 ring-2 ring-orange-100"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt="thumbnail"
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột giữa & phải: Thông tin & Mua hàng */}
            <div className="lg:col-span-7 p-6 lg:p-10">
              <div className="flex flex-col h-full">
                {/* Brand & Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-blue-50 text-blue-600 border-none hover:bg-blue-100 px-3 py-1">
                    Chính hãng
                  </Badge>
                  <span className="text-sm font-semibold text-orange-600 uppercase tracking-widest">
                    {product.brand?.name || "TotMart"}
                  </span>
                </div>

                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                  {product.name}
                </h1>

                {/* Ratings */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-4 h-4 fill-orange-400 text-orange-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-900 ml-1">
                      4.9
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="text-sm text-gray-500">
                    <span className="text-gray-900 font-semibold">1.2k</span>{" "}
                    Đánh giá
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="text-sm text-gray-500">
                    <span className="text-gray-900 font-semibold">4.5k</span> Đã
                    bán
                  </div>
                </div>

                {/* Price Block */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-orange-600">
                        ₫{product.price?.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through text-lg">
                          ₫{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Giá đã bao gồm thuế VAT
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="destructive"
                      className="animate-pulse rounded-full px-3"
                    >
                      Tiết kiệm 15%
                    </Badge>
                    <div className="flex items-center gap-1 text-orange-600 text-[13px] font-bold">
                      <Zap className="w-4 h-4 fill-current" /> Flash Sale kết
                      thúc sau 02:00:00
                    </div>
                  </div>
                </div>

                {/* Quantity & CTA */}
                <div className="space-y-6" ref={mainAddToCartRef}>
                  <div className="flex items-center gap-8">
                    <span className="text-sm font-bold text-gray-700">
                      Số lượng
                    </span>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-14 text-center font-bold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400 italic">
                      Còn 45 sản phẩm trong kho
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="flex-[1.5] h-16 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-[0.98]">
                      Mua ngay
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-16 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold rounded-xl gap-2 transition-all"
                    >
                      <ShoppingCart className="w-6 h-6" /> Thêm vào giỏ
                    </Button>
                  </div>
                </div>

                {/* Trust Elements */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-100">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      Miễn phí giao hàng toàn quốc
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      Bảo hành 24 tháng chính hãng
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      7 ngày đổi trả dễ dàng
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 & 3: DETAILS & RECOMMENDATIONS */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            {/* Tabs Detail */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-14 p-0">
                  <TabsTrigger
                    value="description"
                    className="px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent font-bold"
                  >
                    Mô tả sản phẩm
                  </TabsTrigger>
                  <TabsTrigger
                    value="specs"
                    className="px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent font-bold"
                  >
                    Chi tiết thành phần
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent font-bold"
                  >
                    Đánh giá (128)
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="description"
                  className="p-6 prose max-w-none text-gray-600 leading-relaxed"
                >
                  <p>
                    {product.description ||
                      "Nội dung mô tả sản phẩm đang được cập nhật..."}
                  </p>
                </TabsContent>
                <TabsContent value="specs" className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        label: "Thương hiệu",
                        value: product.brand?.name || "TotMart",
                      },
                      { label: "Danh mục", value: product.category?.name },
                      { label: "Chất liệu", value: "Premium Grade A" },
                      { label: "Xuất xứ", value: "Việt Nam" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex py-3 border-b border-gray-50 last:border-none"
                      >
                        <span className="w-1/3 text-sm text-gray-500">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="p-6 text-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <Star className="w-12 h-12 text-gray-200" />
                    <p className="text-gray-500">
                      Chưa có đánh giá nào cho sản phẩm này.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Related Products */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 uppercase">
                  Sản phẩm tương tự
                </h2>
                <Link
                  href="#"
                  className="group flex items-center gap-1 text-orange-600 text-sm font-bold"
                >
                  Xem tất cả{" "}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {relatedProducts.map((item) => (
                  <ProductCardGrid key={item._id} product={item} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Same Brand Sidebar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-6 uppercase border-l-4 border-orange-500 pl-4">
                Cùng hãng {product.brand?.name}
              </h3>
              <div className="space-y-6">
                {brandProducts.map((item) => (
                  <Link
                    key={item._id}
                    href={`/products/${item.slug}-${item._id}`}
                    className="flex gap-4 group"
                  >
                    <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      <Image
                        src={item.images?.[0]?.url}
                        alt={item.name}
                        fill
                        className="object-contain p-2 transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
                        {item.name}
                      </h4>
                      <p className="text-orange-600 font-extrabold text-sm">
                        ₫{item.price?.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-6 text-gray-400 hover:text-orange-600 font-bold border-t pt-4 rounded-none"
              >
                Xem thêm sản phẩm của hãng
              </Button>
            </div>

            {/* Banner Quảng cáo phụ */}
            <div className="relative aspect-3/4 rounded-xl overflow-hidden shadow-md group">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070"
                alt="ad"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                <Badge className="w-fit mb-2 bg-orange-600">HOT DEAL</Badge>
                <h4 className="font-bold text-xl mb-2">
                  Ưu đãi giảm giá 30% cho phụ kiện đi kèm
                </h4>
                <Button
                  size="sm"
                  className="w-fit bg-white text-black hover:bg-gray-100"
                >
                  Khám phá ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t z-60 py-4 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] transition-transform duration-500 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hidden sm:block">
              <Image
                src={product.images?.[0]?.url}
                alt="sticky"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="max-w-50 md:max-w-md">
              <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                {product.name}
              </h4>
              <p className="text-orange-600 font-black text-sm">
                ₫{product.price?.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="hidden md:flex border-orange-600 text-orange-600 font-bold"
            >
              Thêm vào giỏ
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 font-extrabold px-8 rounded-lg shadow-lg shadow-orange-100">
              MUA NGAY
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/**
 * Component Thẻ sản phẩm gợi ý
 */
function ProductCardGrid({ product }) {
  return (
    <Link
      href={`/products/${product.slug}-${product._id}`}
      className="bg-white p-3 rounded-xl shadow-sm border border-transparent hover:border-orange-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={product.images?.[0]?.url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
          <Badge className="bg-white/90 text-black text-[10px] w-fit shadow-sm">
            -12%
          </Badge>
        </div>
      </div>
      <div className="flex flex-col grow px-1">
        <h3 className="text-[13px] font-bold text-gray-800 mb-2 line-clamp-2 min-h-10 leading-tight group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-600 font-black text-base">
              ₫{product.price?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex text-orange-400">
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="text-[11px] text-gray-400 font-medium border-l pl-2 ml-1">
              Đã bán 1k+
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">
          Đang tải dữ liệu TotMart...
        </p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <div className="text-8xl font-black text-gray-100">404</div>
      <p className="text-xl font-bold text-gray-600">
        Rất tiếc, sản phẩm không tồn tại!
      </p>
      <Link href="/homepage">
        <Button className="bg-orange-600 px-8 rounded-full font-bold h-12 shadow-lg shadow-orange-100">
          QUAY LẠI TRANG CHỦ
        </Button>
      </Link>
    </div>
  );
}
