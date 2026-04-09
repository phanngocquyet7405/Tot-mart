import { Plus } from "lucide-react";
import Image from "next/image";

export default function CartItem({ product }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4">
        {/* Vùng hiển thị ảnh */}
        <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-1">
              No Image
            </div>
          )}
        </div>

        <div>
          <p className="font-bold text-gray-800 line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-green-700 font-bold">${product.price}</span>
            {product.old && (
              <span className="line-through text-gray-400 text-sm">
                ${product.old}
              </span>
            )}
          </div>
        </div>
      </div>

      <button className="bg-[#1a4d2e] text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-md active:scale-90">
        <Plus size={18} />
      </button>
    </div>
  );
}