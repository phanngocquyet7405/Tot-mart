"use client";

import { useState } from "react";
import Layout from "../layout-page";
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
      <title>Liên hệ – TotMart</title>
      <meta
        name="description"
        content="Liên hệ với TotMart để được hỗ trợ về đơn hàng, hợp tác hoặc bất kỳ thắc mắc nào."
      />

      {/* Hero */}
      <section className="bg-card/60 border-b border-border py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
            Liên hệ
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-5 leading-tight tracking-tight">
            Chúng tôi luôn
            <br />
            <em className="text-primary not-italic font-serif">lắng nghe bạn</em>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Dù bạn có câu hỏi về đơn hàng, muốn hợp tác hay chỉ muốn nói xin
            chào — đội ngũ của chúng tôi sẵn sàng giúp đỡ.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-10 lg:gap-12">
          {/* Sidebar info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-2">
                Thông tin liên hệ
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nhiều cách để kết nối với chúng tôi.
              </p>
            </div>
            <div className="space-y-4">
              {CONTACTS.map(({ icon: Icon, label, value, sub }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/40 transition-colors shadow-xs"
                >
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Mạng xã hội
              </p>
              <div className="flex gap-3">
                {[{ icon: MessageSquare, label: "Zalo", href: "#" }].map(
                  ({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="min-h-11 min-w-11 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground rounded-xl flex items-center justify-center transition-colors"
                      aria-label={label}
                    >
                      <Icon size={18} />
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-card rounded-3xl border border-border shadow-xs">
                <div className="w-16 h-16 bg-success/15 rounded-2xl flex items-center justify-center mb-6 text-success-text">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-3">
                  Đã gửi thành công!
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", topic: "", message: "" });
                  }}
                  className="mt-6 text-primary text-sm font-semibold hover:underline min-h-11 inline-flex items-center justify-center"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-5 shadow-xs"
              >
                <h2 className="font-serif text-2xl text-foreground">
                  Gửi tin nhắn
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field id="contact-name" label="Họ và tên *" error={errors.name}>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={inputCls(errors.name)}
                    />
                  </Field>
                  <Field id="contact-email" label="Email *" error={errors.email}>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="ban@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      className={inputCls(errors.email)}
                    />
                  </Field>
                </div>

                <Field id="contact-topic" label="Chủ đề *" error={errors.topic}>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => set("topic", e.target.value)}
                    aria-invalid={!!errors.topic}
                    aria-describedby={errors.topic ? "contact-topic-error" : undefined}
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

                <Field id="contact-message" label="Nội dung *" error={errors.message}>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                    className={`${inputCls(errors.message)} resize-none`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  <span>{loading ? "Đang gửi..." : "Gửi tin nhắn"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive-text">
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(err) {
  return `w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
    err
      ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
      : "border-input focus:ring-primary/20 focus:border-primary"
  }`;
}
