"use client";
import Link from "next/link";
import Layout from "../layout-page";
export default function OffersPage() {
  return <Layout><section className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
    <h1 className="font-serif text-4xl text-stone-900">Ưu đãi TotMart</h1>
    <p className="text-stone-600">Các chương trình ưu đãi sẽ được cập nhật khi có thông báo chính thức. Nếu bạn có mã giảm giá, hãy nhập tại bước thanh toán để kiểm tra điều kiện áp dụng.</p>
    <Link className="inline-block rounded-xl bg-amber-800 px-6 py-3 text-white" href="/products">Khám phá sản phẩm</Link>
  </section></Layout>;
}
