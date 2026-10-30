import Link from "next/link";
import { PackageOpen, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-background">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        <PackageOpen size={40} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full mb-3">
        Mã lỗi 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-serif text-foreground font-medium mb-3">
        Trang không tồn tại
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed">
        Nội dung hoặc liên kết bạn đang tìm kiếm không tồn tại, đã được chuyển đi hoặc tạm thời ngừng hoạt động trên TotMart.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/products"
          className="min-h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors text-sm shadow-xs"
        >
          <span>Khám phá sản phẩm</span>
          <ArrowRight size={15} />
        </Link>
        <Link
          href="/"
          className="min-h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors text-sm shadow-xs"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
