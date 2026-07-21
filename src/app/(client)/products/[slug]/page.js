"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

// UI Components
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import Footer from "@/app/(client)/components/ui/footer";
import CartDrawer from "@/app/(client)/components/Cart_component/cart_drawer";

// Icons từ lucide-react (theo spec)
import {
  Minus,
  Plus,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RefreshCw,
  Package,
  Info,
  ChevronRight,
  Star,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// API & Context
import {
  getProductByIdApi,
  getProductsByCategoryApi,
} from "@/app/services/api/productServices";
import { useCart } from "@/app/context/CartContext";

// Ảnh dự phòng (SVG nhẹ, theo pattern box detail)
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2' ry='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg>";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  // State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(PLACEHOLDER_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Gọi API lấy chi tiết sản phẩm
        const productRes = await getProductByIdApi(slug);
        const productData = productRes?.data?.data || productRes?.data;

        if (productData) {
          setProduct(productData);

          // Lấy ảnh chính - ưu tiên lần lượt
          const mainImage =
            productData.images?.[0]?.url || PLACEHOLDER_IMAGE;
          setSelectedImage(mainImage);

          // Fetch related products từ category
          if (productData.category?._id || productData.category) {
            const categoryId =
              productData.category?._id || productData.category;
            const relatedRes = await getProductsByCategoryApi(categoryId);
            const relatedData = relatedRes?.data?.data || relatedRes?.data || [];

            // Lọc bỏ sản phẩm hiện tại
            const filtered = Array.isArray(relatedData)
              ? relatedData.filter((p) => p._id !== productData._id)
              : [];
            setRelatedProducts(filtered.slice(0, 8));
          }
        } else {
          toast.error("Không thể tải thông tin sản phẩm");
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        toast.error("Có lỗi xảy ra khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  // Tính giá sau giảm giá
  const getFinalPrice = () => {
    if (!product) return 0;
    if (product.discount > 0) {
      return product.price - (product.price * product.discount) / 100;
    }
    return product.price;
  };

  // Tăng giảm số lượng
  const increaseQty = () => {
    if (!product) return;
    const maxStock = product.stock || 99;
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      const finalPrice = getFinalPrice();
      const itemToAdd = {
        _id: product._id,
        id: product._id,
        name: product.name,
        image: product.images?.[0]?.url || PLACEHOLDER_IMAGE,
        price: finalPrice,
      };

      // Thêm số lượng vào giỏ
      for (let i = 0; i < quantity; i++) {
        addToCart(itemToAdd);
      }

      toast.success(
        `Đã thêm ${quantity} ${product.name} vào giỏ hàng`
      );
      setIsCartOpen(true);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Xử lý Share
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Xem sản phẩm: ${product?.name}`,
          url,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
      } catch {
        toast.error("Không thể sao chép liên kết");
      }
    }
  };

  // Xử lý Wishlist
  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted
        ? "Đã xóa khỏi danh sách yêu thích"
        : "Đã thêm vào danh sách yêu thích"
    );
  };

  // Format price
  const fmtPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Loading skeleton
  if (loading) {
    return (
      <>
        <AnnouncementBar />
        <MainHeader />
        <NavMenu />
        <div className="min-h-screen bg-white animate-pulse">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-200 aspect-square rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-6 bg-slate-200 rounded w-1/2" />
                <div className="h-32 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AnnouncementBar />
        <MainHeader />
        <NavMenu />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Sản phẩm không tìm thấy
            </h2>
            <p className="text-slate-600">
              Sản phẩm bạn tìm kiếm có thể đã bị xóa hoặc không còn có sẵn.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const finalPrice = getFinalPrice();
  const discount = product.discount || 0;
  const avgRating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8 text-slate-600">
            <span>Sản phẩm</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium truncate">
              {product.name}
            </span>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img.url || PLACEHOLDER_IMAGE)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === img.url
                          ? "border-indigo-600"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Image
                        src={img.url || PLACEHOLDER_IMAGE}
                        alt={`${product.name} ${idx + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                {avgRating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(avgRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">
                      {avgRating.toFixed(1)} ({reviewCount} đánh giá)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-indigo-600">
                    {fmtPrice(finalPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="text-lg text-slate-500 line-through">
                      {fmtPrice(product.price)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-sm text-rose-600 font-medium">
                    Tiết kiệm {fmtPrice(product.price - finalPrice)}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    (product.stock || 0) > 0
                      ? "bg-green-500"
                      : "bg-slate-400"
                  }`}
                />
                <span className="text-slate-700 font-medium">
                  {(product.stock || 0) > 0
                    ? `Còn ${product.stock} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  Số lượng
                </label>
                <div className="flex items-center gap-2 bg-slate-50 w-fit rounded-lg p-1">
                  <button
                    onClick={decreaseQty}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-5 h-5 text-slate-700" />
                  </button>
                  <span className="w-12 text-center font-semibold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQty}
                    disabled={(product.stock || 99) <= quantity}
                    className="p-2 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  (product.stock || 0) <= 0
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-lg font-semibold transition-all duration-200"
              >
                {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
              </Button>

              {/* Share & Wishlist */}
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium py-3 rounded-lg hover:bg-slate-50 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </button>
                <button
                  onClick={handleWishlist}
                  className={`flex-1 flex items-center justify-center gap-2 font-medium py-3 rounded-lg transition-all duration-200 ${
                    isWishlisted
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-current" : ""
                    }`}
                  />
                  Yêu thích
                </button>
              </div>

              {/* Benefits Badges */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="text-sm text-slate-700">
                    Miễn phí vận chuyển
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="text-sm text-slate-700">
                    Đổi trả dễ dàng
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="text-sm text-slate-700">
                    Đảm bảo chất lượng
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab System */}
          <div className="mb-16">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-lg p-1">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  Chi tiết
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  Đánh giá
                </TabsTrigger>
                <TabsTrigger
                  value="specs"
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all"
                >
                  Thông số
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Mô tả sản phẩm
                  </h3>
                  <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                    {product.description ? (
                      <p>{product.description}</p>
                    ) : (
                      <p className="text-slate-500 italic">
                        Chưa có mô tả chi tiết
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Đánh giá từ khách hàng
                      </h3>
                      <p className="text-slate-600">
                        {reviewCount} đánh giá
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-indigo-600 mb-1">
                        {avgRating.toFixed(1)}
                      </div>
                      <div className="flex gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(avgRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {reviewCount === 0 ? (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">
                        Chưa có đánh giá nào cho sản phẩm này
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-600">
                      Sản phẩm có {reviewCount} đánh giá từ khách hàng hài lòng
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Specifications Tab */}
              <TabsContent value="specs" className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Thông số kỹ thuật
                  </h3>
                  <div className="space-y-3">
                    {product.sku && (
                      <div className="flex justify-between py-3 border-b border-slate-200">
                        <span className="text-slate-600">Mã sản phẩm (SKU)</span>
                        <span className="font-semibold text-slate-900">
                          {product.sku}
                        </span>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between py-3 border-b border-slate-200">
                        <span className="text-slate-600">Danh mục</span>
                        <span className="font-semibold text-slate-900">
                          {product.category.name ||
                            product.category}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-slate-200">
                      <span className="text-slate-600">Tồn kho</span>
                      <span className="font-semibold text-slate-900">
                        {product.stock || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-8">
                Sản phẩm liên quan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct._id}
                    className="overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => {
                      // Navigate to product
                      window.location.href = `/products/${relatedProduct.slug || relatedProduct._id}`;
                    }}
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-slate-50">
                      <Image
                        src={
                          relatedProduct.images?.[0]?.url ||
                          PLACEHOLDER_IMAGE
                        }
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      {relatedProduct.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-rose-600 text-white px-2 py-1 rounded text-xs font-bold">
                          -{relatedProduct.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-indigo-600">
                          {fmtPrice(
                            relatedProduct.discount > 0
                              ? relatedProduct.price -
                                  (relatedProduct.price *
                                    relatedProduct.discount) /
                                    100
                              : relatedProduct.price
                          )}
                        </span>
                        {relatedProduct.discount > 0 && (
                          <span className="text-sm text-slate-500 line-through">
                            {fmtPrice(relatedProduct.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      {isCartOpen && (
        <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
      )}
    </>
  );
}
