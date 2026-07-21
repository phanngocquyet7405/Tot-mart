/**
 * SectionCard.js
 * Card wrapper dùng chung cho mọi section trong checkout
 * Palette: indigo-600 primary, slate colors
 */

export function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-indigo-600">{icon}</span>
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
