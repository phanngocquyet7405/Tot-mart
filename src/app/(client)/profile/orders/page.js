"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { axiosConfig } from "@/app/services/api/axiosConfig";

const statuses = { pending: "Chờ xác nhận", processing: "Đang xử lý", shipped: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy", returned: "Đã trả hàng", on_hold: "Tạm giữ" };
const payments = { pending: "Chưa thanh toán", paid: "Đã thanh toán", failed: "Thanh toán thất bại" };
const money = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

export default function MyOrdersPage() {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axiosConfig.get("/orders", { params: { page, limit: 10 } }).then((response) => {
      if (active) setResult(response);
    }).catch(() => { if (active) setError("Không thể tải đơn hàng. Vui lòng thử lại."); });
    return () => { active = false; };
  }, [page, revision]);

  function load(nextPage) {
    setResult(null);
    setError("");
    setPage(nextPage);
    setRevision((value) => value + 1);
  }

  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      <Link href="/profile" className="text-green-700 underline">Hồ sơ cá nhân</Link>
    </div>
    {error ? <div role="alert"><p>{error}</p><button className="text-green-700 underline mt-2" onClick={() => load(page)}>Thử lại</button></div>
      : !result ? <p role="status">Đang tải đơn hàng...</p>
      : <>
        {result.data.length === 0 && <div className="border rounded-xl p-8 text-center"><p className="mb-4">Bạn chưa có đơn hàng nào.</p><Link className="text-green-700 underline" href="/products">Mua sắm ngay</Link></div>}
        {result.data.map((order) => <article key={order._id} className="border rounded-xl p-5 bg-white space-y-3">
          <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{order.orderId}</h2><span>{statuses[order.status] || order.status}</span></div>
          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString("vi-VN")} · {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"} · {payments[order.paymentStatus]}</p>
          <ul className="divide-y">{order.products.map((item, index) => <li key={index} className="flex justify-between gap-4 py-2"><span>{item.name} × {item.quantity}</span><span>{money(item.totalPrice)}</span></li>)}</ul>
          <p className="text-right font-bold">Tổng cộng: {money(order.totalAmount)}</p>
          <details className="text-sm"><summary className="cursor-pointer text-green-700">Chi tiết giao hàng</summary>
            <div className="mt-2 space-y-1"><p>{order.shippingAddress?.fullName} · {order.shippingAddress?.phone}</p><p>{[order.shippingAddress?.address, order.shippingAddress?.district, order.shippingAddress?.city].filter(Boolean).join(", ")}</p><p>Phí giao hàng: {money(order.shippingFee)} · Giảm giá: {money(order.discountAmount)}</p>{order.cancelReason && <p>Lý do hủy: {order.cancelReason}</p>}</div>
          </details>
        </article>)}
        {result.pagination.totalPages > 1 && <nav aria-label="Phân trang đơn hàng" className="flex justify-between items-center">
          <button disabled={page === 1} onClick={() => load(page - 1)} className="border rounded px-4 py-2 disabled:opacity-40">Trang trước</button>
          <span>{page} / {result.pagination.totalPages}</span>
          <button disabled={page >= result.pagination.totalPages} onClick={() => load(page + 1)} className="border rounded px-4 py-2 disabled:opacity-40">Trang sau</button>
        </nav>}
      </>}
  </main>;
}
