"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

// UI Components
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import HeroSection from "../../../components/hero_section_page/hero_section";
import FeaturedProducts from "../../../components/layout/product/featured_products";
import Footer from "@/app/(client)/components/ui/footer";
import CartDrawer from "@/app/(client)/components/Cart_component/cart_drawer";
import {
  getBoxByIdApi,
  getProductsInBoxApi,
} from "@/app/services/api/boxService";
import { useCart } from "@/app/context/CartContext";

// Icons từ Lucide tương thích thiết kế Shadcn cao cấp
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
  Box,
  CheckCircle2,
  ChevronRight,
  Info,
} from "lucide-react";

// shadcn / UI components
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Ảnh dự phòng chất lượng cao dạng SVG siêu nhẹ, tránh lỗi trống src
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2' ry='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg>";

export default function BoxDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [box, setBox] = useState(null);
  const [boxProducts, setBoxProducts] = useState([]); // State mới để lưu chi tiết sản phẩm trong box
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(PLACEHOLDER_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("inside"); // 'inside' hoặc 'description'
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Khởi chạy lấy dữ liệu từ API
  // Khởi chạy lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Gọi API song song để lấy thông tin Box và danh sách Sản phẩm trong Box
        const [boxRes, productsRes] = await Promise.all([
          getBoxByIdApi(id),
          getProductsInBoxApi(id).catch((err) => {
            console.error("Lỗi khi tải danh sách sản phẩm trong hộp:", err);
            return { data: [] };
          }),
        ]);

        // Xử lý data linh hoạt (phòng trường hợp axios bọc data 2 lần)
        const boxData = boxRes?.data?.data || boxRes?.data;
        const productsData = productsRes?.data?.data || productsRes?.data || [];

        if (boxData) {
          setBox(boxData);

          // CHIẾN LƯỢC LẤY ẢNH CHÍNH (SMART FALLBACK):
          // 1. Ưu tiên 1: Lấy ảnh trực tiếp của cái Hộp (Box)
          const boxImage = boxData.images?.[0]?.url;

          // 2. Ưu tiên 2: Lấy ảnh của sản phẩm ĐẦU TIÊN nằm bên trong Hộp (dựa theo JSON bạn gửi)
          const firstProductImage =
            productsData?.[0]?.product?.images?.[0]?.url;

          // 3. Chốt ảnh: Nếu 1 và 2 đều không có thì dùng ảnh xám mặc định
          const finalImage = boxImage || firstProductImage || PLACEHOLDER_IMAGE;

          setSelectedImage(finalImage);
        }

        // Lưu danh sách sản phẩm chi tiết
        setBoxProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết hộp sản phẩm:", err);
        toast.error("Không thể tải thông tin chi tiết hộp sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Tính toán giá tiền sau khuyến mãi
  const getFinalPrice = () => {
    if (!box) return 0;
    if (box.discountPercent > 0) {
      return box.value - (box.value * box.discountPercent) / 100;
    }
    return box.value;
  };

  // Điều khiển tăng giảm số lượng
  const increaseQty = () => {
    if (!box) return;
    const maxStock = box.stock !== undefined ? box.stock : 99;
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  // Logic thêm vào giỏ hàng đồng bộ với Cart Drawer
  const handleAddToCart = () => {
    if (!box) return;

    const finalPrice = getFinalPrice();
    const itemToAdd = {
      _id: box._id,
      name: box.name,
      image: box.images?.[0]?.url || PLACEHOLDER_IMAGE,
      price: finalPrice,
    };

    // Thêm số lượng mong muốn vào giỏ hàng
    for (let i = 0; i < quantity; i++) {
      addToCart(itemToAdd);
    }

    toast.success(`Đã thêm thành công ${quantity} hộp quà vào giỏ hàng 🛒`);
    setIsCartOpen(true); // Trượt Drawer giỏ hàng ra ngay lập tức
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 text-sm font-medium">
            Đang chuẩn bị hộp quà cao cấp...
          </p>
        </div>
      </div>
    );
  }

  if (!box) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200 max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Box size={32} />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Không tìm thấy dữ liệu
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Hộp quà này không tồn tại hoặc đã bị gỡ khỏi hệ thống.
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-amber-800 hover:bg-amber-900 text-white active:scale-95 transition-all"
          >
            Quay lại trang trước
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <NavMenu />
      <MainHeader />

      {/* Drawer Giỏ hàng */}
      <CartDrawer open={isCartOpen} setOpen={setIsCartOpen} />

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Breadcrumb nhỏ phong cách Shadcn */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-8 uppercase tracking-widest font-semibold">
          <span>Cửa hàng</span>
          <ChevronRight size={12} />
          <span>Hộp quà cao cấp</span>
          <ChevronRight size={12} />
          <span className="text-stone-800 truncate max-w-xs">{box.name}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* CỘT TRÁI - KHU VỰC HÌNH ẢNH SẢN PHẨM (Mặc định lấy ảnh đầu tiên) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative border border-stone-100 rounded-2xl overflow-hidden bg-white shadow-sm aspect-square flex items-center justify-center group">
              <Image
                src={selectedImage || PLACEHOLDER_IMAGE}
                alt={box.name || "Product Box Image"}
                fill
                className="object-cover p-2 transition-transform duration-500 group-hover:scale-105"
                priority
                unoptimized
              />

              {box.discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-red-600 text-white px-3.5 py-1 text-xs font-black rounded-full shadow-md tracking-wider">
                  SALE {box.discountPercent}%
                </span>
              )}

              {box.isGift && (
                <span className="absolute top-4 right-4 bg-stone-900 text-white px-3.5 py-1 text-xs font-black rounded-full shadow-md tracking-wider">
                  PREMIUM
                </span>
              )}
            </div>

            {/* Ảnh thu nhỏ (Thumbnails) */}
            {box.images && box.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
                {box.images.map((img, i) => {
                  const imgUrl = img?.url || PLACEHOLDER_IMAGE;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 shrink-0 transition-all active:scale-95 ${
                        selectedImage === imgUrl
                          ? "border-amber-700 ring-4 ring-amber-100"
                          : "border-stone-200 hover:border-amber-400"
                      }`}
                    >
                      <Image
                        alt={`Thumbnail ${i}`}
                        src={imgUrl}
                        fill
                        className="object-cover p-1"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CỘT PHẢI - THÔNG TIN CHI TIẾT SẢN PHẨM & MUA HÀNG */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 md:p-8 border border-stone-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                🎁 Độc quyền tại TotBox
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight">
                {box.name}
              </h1>
            </div>

            {/* Giá tiền */}
            <div className="flex items-baseline gap-3 p-4 bg-[#faf8f4] rounded-xl border border-stone-100">
              <span className="text-2xl md:text-3xl text-red-600 font-black">
                {getFinalPrice().toLocaleString("vi-VN")}₫
              </span>
              {box.discountPercent > 0 && (
                <span className="text-stone-400 line-through text-sm">
                  {box.value?.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>

            {/* Thông số kỹ thuật nhanh */}
            <div className="grid grid-cols-2 gap-4 text-xs md:text-sm text-stone-600 border-y border-stone-100 py-4">
              <div className="space-y-1">
                <p className="text-stone-400">Số lượng món bên trong:</p>
                <p className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Package size={16} className="text-amber-700" />
                  {/* Ưu tiên độ dài của list API lấy được, hoặc số lượng từ Box */}
                  {boxProducts.length > 0
                    ? boxProducts.length
                    : box.totalItem || 0}{" "}
                  sản phẩm
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-stone-400">Tình trạng kho hàng:</p>
                <p className="font-bold">
                  {box.stock > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Còn lại {box.stock} hộp
                    </span>
                  ) : (
                    <span className="text-red-500">Tạm hết hàng</span>
                  )}
                </p>
              </div>
            </div>

            {/* Bộ điều khiển số lượng mua */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                Chọn số lượng mua
              </label>
              <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden shadow-sm w-fit">
                <button
                  onClick={decreaseQty}
                  className="p-3.5 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition active:scale-90"
                  type="button"
                >
                  <Minus size={14} />
                </button>
                <span className="px-6 font-black text-stone-800 min-w-12 text-center text-sm">
                  {quantity}
                </span>
                <button
                  onClick={increaseQty}
                  className="p-3.5 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition active:scale-90"
                  type="button"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Các nút hành động chính */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={box.stock <= 0}
                className="flex-1 py-6 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-amber-900/15 flex items-center justify-center gap-2 active:scale-95 transition-transform duration-100 cursor-pointer"
              >
                <ShoppingCart size={18} />
                Thêm vào giỏ hàng
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="p-3 w-12 h-12 flex items-center justify-center rounded-xl border-stone-200 text-stone-500 hover:text-red-500 hover:border-red-200 active:scale-90 transition-all cursor-pointer"
                >
                  <Heart size={18} />
                </Button>

                <Button
                  variant="outline"
                  className="p-3 w-12 h-12 flex items-center justify-center rounded-xl border-stone-200 text-stone-500 hover:text-blue-500 hover:border-blue-200 active:scale-90 transition-all cursor-pointer"
                >
                  <Share2 size={18} />
                </Button>
              </div>
            </div>

            {/* Chính sách hỗ trợ khách hàng */}
            <div className="pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-500">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-50 rounded-lg text-amber-800">
                  <Truck size={16} />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Miễn phí ship</p>
                  <p className="text-[10px]">Đơn hàng toàn quốc</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-50 rounded-lg text-amber-800">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Bảo hành cam kết</p>
                  <p className="text-[10px]">Đóng gói chuẩn chỉnh</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-50 rounded-lg text-amber-800">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Hỗ trợ đổi trả</p>
                  <p className="text-[10px]">Trong vòng 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THIẾT KẾ MỚI: PHÂN TÁCH TAB MÔ TẢ & LIỆT KÊ CHI TIẾT SẢN PHẨM PHONG CÁCH SHADCN */}
        <div className="mt-16 bg-white border border-stone-200/60 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Header điều hướng Tabs */}
          <div className="flex border-b border-stone-100 mb-8 gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("inside")}
              className={`pb-4 text-sm md:text-base font-black uppercase tracking-widest transition-all relative whitespace-nowrap active:scale-95 ${
                activeTab === "inside"
                  ? "text-amber-800"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Sản phẩm trong hộp ({boxProducts.length || 0})
              {activeTab === "inside" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-sm md:text-base font-black uppercase tracking-widest transition-all relative whitespace-nowrap active:scale-95 ${
                activeTab === "description"
                  ? "text-amber-800"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Mô tả hộp quà
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800 rounded-full" />
              )}
            </button>
          </div>

          {/* Nội dung Tab 1: Chi tiết sản phẩm thành phần thiết kế dạng Thẻ quà tặng trực quan */}
          {activeTab === "inside" && (
            <div className="space-y-6">
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start text-xs text-amber-900/80 leading-relaxed">
                <Info size={16} className="text-amber-800 shrink-0 mt-0.5" />
                <p>
                  Tất cả các sản phẩm thành phần dưới đây đều được lựa chọn kỹ
                  lưỡng, đóng gói bảo quản chuẩn chỉnh và xếp ngay ngắn bên
                  trong hộp quà sang trọng này trước khi gửi tới bạn.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {boxProducts && boxProducts.length > 0 ? (
                  boxProducts.map((item, i) => {
                    // Xử lý linh hoạt dữ liệu trả về (trường hợp item bọc trong object hoặc là chính object sản phẩm)
                    const p = item.product || item;
                    const itemQuantity = item.quantity || p.quantity || 1;

                    return (
                      <div
                        key={p._id || i}
                        className="group border border-stone-100 hover:border-amber-200 bg-[#faf8f4]/30 hover:bg-white p-4 rounded-xl transition-all duration-300 shadow-sm flex items-center gap-4"
                      >
                        {/* Thumbnail sản phẩm thành phần */}
                        <div className="relative w-16 h-16 rounded-lg bg-stone-50 border border-stone-150 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.images?.[0]?.url || p.image ? (
                            <Image
                              src={p.images?.[0]?.url || p.image}
                              alt={p.name || "Sản phẩm"}
                              fill
                              className="object-cover p-1 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="text-amber-700 bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center">
                              <Package size={22} />
                            </div>
                          )}
                          <span className="absolute -top-1 -right-1 bg-amber-800 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                            {itemQuantity}
                          </span>
                        </div>

                        {/* Thông tin sản phẩm bên trong */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-800 text-sm group-hover:text-amber-800 transition-colors line-clamp-1">
                            {p.name || "Sản phẩm chưa có tên"}
                          </p>
                          <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                            <CheckCircle2
                              size={12}
                              className="text-emerald-500 shrink-0"
                            />
                            <span>Đóng gói: x{itemQuantity} cái</span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-stone-400 text-sm italic col-span-full py-6 text-center">
                    Chưa có thông tin danh mục sản phẩm chi tiết bên trong hộp.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Nội dung Tab 2: Mô tả chi tiết của Hộp quà */}
          {activeTab === "description" && (
            <div className="space-y-4">
              <p className="text-stone-600 leading-relaxed text-sm md:text-base whitespace-pre-line bg-[#faf8f4]/40 p-6 rounded-xl border border-stone-100">
                {box.descriptions ||
                  "Chưa có thông tin mô tả chi tiết của hộp quà này."}
              </p>
              {box.descriptions && box.descriptions.length > 200 && (
                <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
                  <Info size={14} />
                  <span>
                    Dữ liệu mô tả được kiểm duyệt bởi ban biên tập nội dung
                    TotBox.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FeaturedProducts />
      <Footer />
    </>
  );
}
