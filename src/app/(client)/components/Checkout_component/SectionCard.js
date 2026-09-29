/**
 * SectionCard.js
 * Card dùng chung cho mọi section trong checkout.
 * Nền trắng trên giấy cream, viền clay, không đổ bóng khi nghỉ.
 * `aside`: dòng phụ căn phải ở header (vd. số lượng sản phẩm).
 */

export function SectionCard({ title, icon, aside, children }) {
  return (
    <section className="bg-white border border-[#F0DDD5] rounded-2xl p-5 sm:p-7">
      <header className="flex items-center gap-3 mb-5">
        {icon && (
          <span className="grid place-items-center w-9 h-9 rounded-full bg-[#FFF0EB] text-[#C85C3C] shrink-0">
            {icon}
          </span>
        )}
        <h2 className="font-serif text-xl font-semibold text-[#2C1810] leading-tight">
          {title}
        </h2>
        {aside && (
          <span className="ml-auto text-xs text-stone-500 shrink-0">{aside}</span>
        )}
      </header>
      {children}
    </section>
  );
}
