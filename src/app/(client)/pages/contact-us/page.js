"use client";

import { useState } from "react";
import Layout from "../layout-page";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../../components/ui/footer";
import CartDrawer from "../../components/Cart_component/cart_drawer";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

const CONTACTS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@totmart.vn",
    sub: "Phản hồi trong 24h",
  },
  {
    icon: Phone,
    label: "Điện thoại",
    value: "1800 6868",
    sub: "Thứ 2–6, 8:00–18:00",
  },
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "18 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
    sub: "Showroom & Văn phòng",
  },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "8:00 – 18:00",
    sub: "Thứ 2 đến Thứ 6",
  },
];

const TOPICS = [
  "Đơn hàng & Vận chuyển",
  "Đăng ký gói Subscribe",
  "Hợp tác nhà sản xuất",
  "Khiếu nại & Hoàn tiền",
  "Quà tặng doanh nghiệp",
  "Khác",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập tên";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Email không hợp lệ";
    if (!form.topic) e.topic = "Vui lòng chọn chủ đề";
    if (!form.message.trim()) e.message = "Vui lòng nhập nội dung";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <Layout>
      {/* Replaced next/head with direct React 19 tags */}
      <title>Liên hệ – TotMart</title>
      <meta
        name="description"
        content="Liên hệ với TotMart để được hỗ trợ về đơn hàng, hợp tác hoặc bất kỳ thắc mắc nào."
      />

      {/* Hero */}
      <section className="bg-[#f5f0e8] pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-6">
            Liên hệ
          </span>
          <h1 className="font-serif text-5xl text-stone-900 mb-5 leading-tight">
            Chúng tôi luôn
            <br />
            <em className="text-amber-800">lắng nghe bạn</em>
          </h1>
          <p className="text-stone-600 text-base leading-relaxed max-w-xl mx-auto">
            Dù bạn có câu hỏi về đơn hàng, muốn hợp tác hay chỉ muốn nói xin
            chào — đội ngũ của chúng tôi sẵn sàng giúp đỡ.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Sidebar info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-stone-900 mb-2">
                Thông tin liên hệ
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                Nhiều cách để kết nối với chúng tôi.
              </p>
            </div>
            <div className="space-y-4">
              {CONTACTS.map(({ icon: Icon, label, value, sub }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-stone-100 hover:border-amber-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-amber-800" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-stone-800">
                      {value}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
                Mạng xã hội
              </p>
              <div className="flex gap-3">
                {[{ icon: MessageSquare, label: "Zalo", href: "#" }].map(
                  ({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-amber-800 transition-colors"
                      aria-label={label}
                    >
                      <Icon size={16} />
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 bg-white rounded-3xl border border-stone-100">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="font-serif text-2xl text-stone-900 mb-3">
                  Đã gửi thành công!
                </h3>
                <p className="text-stone-500 text-sm max-w-sm leading-relaxed">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ
                  làm việc.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", topic: "", message: "" });
                  }}
                  className="mt-8 text-amber-800 text-sm font-semibold hover:underline"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-stone-100 p-8 space-y-5"
              >
                <h2 className="font-serif text-2xl text-stone-900">
                  Gửi tin nhắn
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Họ và tên *" error={errors.name}>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inputCls(errors.name)}
                    />
                  </Field>
                  <Field label="Email *" error={errors.email}>
                    <input
                      type="email"
                      placeholder="ban@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls(errors.email)}
                    />
                  </Field>
                </div>

                <Field label="Chủ đề *" error={errors.topic}>
                  <select
                    value={form.topic}
                    onChange={(e) => set("topic", e.target.value)}
                    className={inputCls(errors.topic)}
                  >
                    <option value="">— Chọn chủ đề —</option>
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Nội dung *" error={errors.message}>
                  <textarea
                    rows={5}
                    placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className={`${inputCls(errors.message)} resize-none`}
                  />
                </Field>

                {/* Flattened className below */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-amber-800 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {loading ? "Đang gửi..." : "Gửi tin nhắn"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Flattened the string template to avoid any white-space/newline mismatch
function inputCls(err) {
  return `w-full px-4 py-3 text-sm rounded-xl border bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors ${err ? "border-red-300 bg-red-50/30" : "border-stone-200"}`;
}
