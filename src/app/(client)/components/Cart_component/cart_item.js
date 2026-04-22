import { Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

export default function CartItem({ product }) {
  const { updateQuantity, removeFromCart } = useCart();

  // Xử lý lấy ảnh từ cấu trúc dữ liệu product thật (product.images[0].url)
  const imageUrl =
    product.images?.[0]?.url || product.image || "/placeholder.svg";
  const productId = product._id || product.id;

  return (
    <div className="flex flex-col bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100">
          <Image
            src={imageUrl}
            alt={product.name || "Product"}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1">
          <p className="font-bold text-gray-800 line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-green-700 font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price)}
            </span>
          </div>
        </div>

        {/* Nút xóa sản phẩm */}
        <button
          onClick={() => removeFromCart(productId)}
          className="text-gray-400 hover:text-red-500 transition-colors p-2"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Control tăng giảm số lượng */}
      {product.quantity && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
            <button
              onClick={() => updateQuantity(productId, -1)}
              className="text-gray-500 hover:text-black transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="font-semibold text-sm w-4 text-center">
              {product.quantity}
            </span>
            <button
              onClick={() => updateQuantity(productId, 1)}
              className="text-gray-500 hover:text-black transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="font-bold text-gray-800 text-sm">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price * product.quantity)}
          </p>
        </div>
      )}
    </div>
  );
}
