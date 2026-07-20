import { ShoppingCart } from "lucide-react";

export default function CartBox({itemCount, totalAmount}){
    return (
        <a
      href="#cart"
      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md">
        <ShoppingCart className="w-5 h-5 text-gray-700" />
        <span className="text-sm text-gray-700">
        {itemCount || 0} items - ${(totalAmount || 0).toFixed(2)}
      </span>
      </a>
    )
}