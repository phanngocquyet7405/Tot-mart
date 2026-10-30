"use client";

import Link from "next/link";
import Layout from "../layout-page";
import { Tag, ArrowRight } from "lucide-react";

export default function OffersPage() {
  return (
    <Layout>
      <title>Ưu đãi TotMart</title>
      <meta
        name="description"
        content="Các chương trình ưu đãi sẽ được cập nhật khi có thông báo chính thức. Nếu bạn có mã giảm giá, hãy nhập tại bước thanh toán để kiểm tra điều kiện áp dụng."
      />

      <section className="bg-card/60 border-b border-border py-16 sm:py-24 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            <Tag size={12} />
            <span>Ưu đãi</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl text-foreground leading-tight tracking-tight">
            Ưu đãi TotMart
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Các chương trình ưu đãi sẽ được cập nhật khi có thông báo chính thức. Nếu bạn có mã giảm giá, hãy nhập tại bước thanh toán để kiểm tra điều kiện áp dụng.
          </p>

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover px-7 py-3 font-semibold text-sm transition-colors min-h-11 shadow-xs"
            >
              <span>Khám phá sản phẩm</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
