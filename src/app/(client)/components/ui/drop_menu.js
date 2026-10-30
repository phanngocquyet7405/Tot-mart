"use client";
import Link from "next/link";

export default function DropMenu({ items, isVisible, onMouseEnter, onMouseLeave }) {
  if (!isVisible || !items?.length) return null;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 top-full z-50 w-full border-t border-border bg-card shadow-xl"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8 p-10">
        {items.map((col, idx) => (
          <div key={idx} className="space-y-4">
            <Link
              href={col.titleHref}
              className="text-[11px] font-black uppercase text-primary hover:text-primary/90"
            >
              {col.title}
            </Link>
            <ul className="space-y-2">
              {col.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <Link href={link.href} className="text-[13px] text-muted-foreground hover:text-foreground">
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
