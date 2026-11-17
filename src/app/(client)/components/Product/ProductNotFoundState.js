"use client";
import Link from "next/link";
export function ProductNotFoundState({ error, onRetry }) {
  return <main className="tm-commerce"><div className="tm-state" role={error ? 'alert' : 'status'}>
    <h1>{error ? 'Chưa tải được sản phẩm' : 'Không tìm thấy sản phẩm'}</h1>
    <p>{error || 'Sản phẩm có thể không còn được bán. Bạn có thể xem các sản phẩm khác trong cửa hàng.'}</p>
    <div className="flex flex-wrap justify-center gap-3">
      {error && <button type="button" className="tm-button tm-button--primary" onClick={onRetry}>Thử lại</button>}
      <Link href="/products" className="tm-button tm-button--outline">Xem sản phẩm</Link>
    </div>
  </div></main>;
}
