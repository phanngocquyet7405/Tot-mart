'use client';

export default function DropMenu({ items, isVisible, onMouseEnter, onMouseLeave }) {
  if (!isVisible) return null;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 z-50 animate-fade-in"
    >
      <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
            {items.map((category, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-[0.15em] border-b border-gray-100 pb-2">
                  {category.title}
                </h3>
                
                <ul className="space-y-2.5">
                  {category.links && category.links.length > 0 ? (
                    category.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <a
                          href={link.href}
                          className="text-sm text-gray-500 hover:text-orange-500 hover:translate-x-1 transition-all duration-300 block"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400 italic font-light">
                      Sản phẩm đang được cập nhật...
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="h-1 w-full bg-linear-to-r from-orange-400 to-rose-400 opacity-20"></div>
      </div>
    </div>
  );
}