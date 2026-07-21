export function ProductLoadingState() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-stone-50/50">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-500 text-sm font-medium">
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    </div>
  );
}
