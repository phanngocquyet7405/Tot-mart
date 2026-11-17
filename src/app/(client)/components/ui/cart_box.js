import { formatCurrency } from "@/app/util/formatter";
import { ShoppingCart } from "lucide-react";

export default function CartBox({itemCount, totalAmount}){
    return (
        <a
      href="#cart"
      className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl border border-border transition-all duration-200 hover:shadow-xs">
        <ShoppingCart className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-foreground">
        {itemCount || 0} sản phẩm - {formatCurrency(totalAmount || 0)}
      </span>
      </a>
    )
}