import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-medium text-gray-700 mb-4">Trang không tồn tại</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Nội dung bạn đang tìm kiếm không tồn tại hoặc đã ngừng hoạt động trên TotMart.
      </p>
      <Link
        href="/products"
        className="px-6 py-2.5 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors"
      >
        Khám phá sản phẩm
      </Link>
    </div>
  );
}
