/**
 * SectionCard.js
 * Card dùng chung cho mọi section trong checkout.
 * Nền card trên nền background, viền border chuẩn token, không đổ bóng khi nghỉ.
 * `aside`: dòng phụ căn phải ở header (vd. số lượng sản phẩm).
 */

export function SectionCard({ title, icon, aside, children }) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 sm:p-7 shadow-xs">
      <header className="flex items-center gap-3 mb-5">
        {icon && (
          <span className="grid place-items-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
            {icon}
          </span>
        )}
        <h2 className="font-serif text-xl font-semibold text-foreground leading-tight">
          {title}
        </h2>
        {aside && (
          <span className="ml-auto text-xs text-muted-foreground shrink-0 tabular-nums">{aside}</span>
        )}
      </header>
      {children}
    </section>
  );
}
