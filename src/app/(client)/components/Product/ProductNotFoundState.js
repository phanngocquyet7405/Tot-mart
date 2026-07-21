import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductNotFoundState() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#faf8f4]">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200 max-w-md">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={32} />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-stone-500 text-sm mb-6">
          Sản phẩm bạn tìm kiếm có thể đã bị xóa hoặc không còn có sẵn.
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
