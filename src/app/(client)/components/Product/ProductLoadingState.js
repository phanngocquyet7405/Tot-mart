export function ProductLoadingState() {
  return (
    <div role="status" aria-live="polite" className="tm-commerce min-h-[70vh] flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    </div>
  );
}
