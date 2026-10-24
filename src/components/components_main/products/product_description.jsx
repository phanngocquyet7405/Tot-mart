"use client";

import ReactMarkdown from "react-markdown";

// ─── Override từng tag Markdown → styled JSX ──────────────────────────────────

const components = {
  // ## Tiêu đề phần (ví dụ: "Your Basket Includes:")
  h2: ({ children }) => (
    <h2 className="text-sm font-black text-[#2C1810] uppercase tracking-wider mt-6 mb-3">
      {children}
    </h2>
  ),

  // h3 nếu cần
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-stone-600 mt-4 mb-2">{children}</h3>
  ),

  // ul: wrapper của danh sách sản phẩm
  ul: ({ children }) => <ul className="space-y-3 my-3">{children}</ul>,

  // li: mỗi dòng sản phẩm — có đường kẻ trái terracotta
  li: ({ children }) => (
    <li className="text-sm text-stone-600 leading-relaxed pl-3 border-l-2 border-[#F0DDD5]">
      {children}
    </li>
  ),

  // p: đoạn văn intro hoặc ghi chú
  p: ({ children }) => (
    <p className="text-sm text-stone-600 leading-relaxed my-2">{children}</p>
  ),

  // **đậm** → tên sản phẩm nổi bật màu đậm
  strong: ({ children }) => (
    <strong className="font-black text-[#2C1810]">{children}</strong>
  ),

  // *nghiêng* → chú thích nhỏ
  em: ({ children }) => (
    <em className="text-stone-400 text-xs not-italic">{children}</em>
  ),
};

// ─── Tách dòng ghi chú ra khỏi body ──────────────────────────────────────────
// Dòng bắt đầu bằng **Please Note / **Lưu ý / **Important → render riêng thành khung vàng

function splitNotes(markdown) {
  const lines = markdown.split("\n");
  const body = [];
  const notes = [];

  for (const line of lines) {
    const isNote =
      line.startsWith("**Please Note") ||
      line.startsWith("**Important") ||
      line.startsWith("**Lưu ý") ||
      line.startsWith("**Quan trọng");

    if (isNote) notes.push(line);
    else body.push(line);
  }

  return { body: body.join("\n"), notes: notes.join("\n") };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ProductDescription({ markdown }) {
  if (!markdown?.trim()) {
    return (
      <p className="text-sm text-stone-400 italic">Chưa có mô tả sản phẩm.</p>
    );
  }

  const { body, notes } = splitNotes(markdown);

  return (
    <div className="product-description space-y-1">
      {/* Body chính */}
      <ReactMarkdown components={components}>{body}</ReactMarkdown>

      {/* Khung ghi chú cuối */}
      {notes && (
        <div className="mt-4 rounded-xl bg-[#FFF8F5] border border-[#F0DDD5] px-4 py-3">
          <ReactMarkdown
            components={{
              ...components,
              // p trong khung note → nhỏ hơn, italic
              p: ({ children }) => (
                <p className="text-xs text-stone-500 leading-relaxed italic">
                  {children}
                </p>
              ),
            }}
          >
            {notes}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
