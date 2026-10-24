"use client";
import Link from "next/link";

export default function DropMenu({
  items,
  isVisible,
  onMouseEnter,
  onMouseLeave,
}) {
  // Debug khi menu xuất hiện
  if (isVisible) {
    console.log("🎨 Rendering DropMenu với items:", items);
  }

  if (!isVisible || !items.length) return null;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 w-full bg-white shadow-xl border-t z-50"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-5 gap-8 p-10">
        {items.map((col, idx) => (
          <div key={idx} className="space-y-4">
            {/* Cấp 2 */}
            <Link
              href={col.titleHref}
              className="font-black text-[11px] uppercase text-orange-600"
            >
              {col.title}
            </Link>

            {/* Cấp 3 */}
            <ul className="space-y-2">
              {col.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-zinc-500 hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
