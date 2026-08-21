"use client";

import { useState } from "react";
import Link from "next/link";
import Layout from "../layout-page";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../../components/ui/footer";
import CartDrawer from "../../components/Cart_component/cart_drawer";
import { ChevronDown, Search, ArrowRight } from "lucide-react";
import { FAQS } from "./faqData";

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border-b border-stone-100 last:border-0 transition-colors ${open ? "bg-amber-50/50" : ""}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 px-6 text-left"
      >
        <span
          className={`text-sm font-medium leading-relaxed ${open ? "text-amber-900" : "text-stone-800"}`}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-stone-400 transition-transform mt-0.5 ${open ? "rotate-180 text-amber-700" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-stone-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#f5f0e8] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-6">
            Trung tâm hỗ trợ
          </span>
          <h1 className="font-serif text-5xl text-stone-900 mb-5 leading-tight">
            Câu hỏi
            <em className="text-amber-800"> thường gặp</em>
          </h1>
          <p className="text-stone-600 mb-8 text-base">
            Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-sm text-stone-800
                placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Category nav */}
          <aside className="hidden md:block">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
              Danh mục
            </p>
            <nav className="space-y-1 sticky top-24">
              {FAQS.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => {
                    setActive(cat.category);
                    document
                      .getElementById(cat.category)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-colors
                    ${active === cat.category ? "bg-amber-100 text-amber-900 font-semibold" : "text-stone-600 hover:bg-stone-100"}`}
                >
                  <span>{cat.emoji}</span>
                  <span className="leading-tight">{cat.category}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* FAQ list */}
          <div className="md:col-span-3 space-y-8">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Không tìm thấy câu hỏi phù hợp.</p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-amber-700 text-sm font-semibold hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              filtered.map((cat) => (
                <div key={cat.category} id={cat.category}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{cat.emoji}</span>
                    <h2 className="font-serif text-xl text-stone-900">
                      {cat.category}
                    </h2>
                  </div>
                  <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                    {cat.items.map((item) => (
                      <AccordionItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Still need help */}
            <div className="bg-stone-900 rounded-2xl p-8 text-center">
              <p className="font-serif text-xl text-white mb-2">
                Vẫn chưa tìm được câu trả lời?
              </p>
              <p className="text-stone-400 text-sm mb-6">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.
              </p>
              <Link
                href="/pages/contact-us"
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
              >
                Liên hệ ngay <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
