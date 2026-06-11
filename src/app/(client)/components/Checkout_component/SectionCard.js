/**
 * SectionCard.js
 * Card wrapper dùng chung cho mọi section trong checkout
 * Palette: warm cream / terracotta — nhất quán với toàn TotMart
 */

export function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-[#F0DDD5] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[#C85C3C]">{icon}</span>
        <h2 className="text-sm font-black text-[#2C1810] uppercase tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
