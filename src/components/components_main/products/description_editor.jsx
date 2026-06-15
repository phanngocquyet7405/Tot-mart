/**
 * DescriptionEditor.jsx
 * Dùng trong admin: AddProductPage / EditProductPage
 *
 * Thay thế <Card> "Mô tả chi tiết" cũ (plain textarea) bằng component này.
 *
 * Cách dùng:
 *   import { DescriptionEditor } from "@/app/components/product/DescriptionEditor";
 *
 *   <DescriptionEditor
 *     value={form.description}
 *     onChange={(val) => setForm({ ...form, description: val })}
 *   />
 *
 * Props:
 *   value    {string}             — nội dung markdown hiện tại
 *   onChange {(val: string)=>void} — callback khi textarea thay đổi
 */

"use client";

import { useState } from "react";
import { Eye, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductDescription } from "./ProductDescription";

// ─── Các nút chèn nhanh Markdown ─────────────────────────────────────────────
// Admin không cần biết Markdown — chỉ cần click để chèn đúng cú pháp

const QUICK_INSERT = [
  {
    label: "## Tiêu đề phần",
    snippet: "\n## Tiêu đề phần\n",
  },
  {
    label: "- Sản phẩm",
    // Format chuẩn kiểu Bokksu: **Tên x N:** Mô tả
    snippet: "\n- **Tên sản phẩm x 1:** Nhập mô tả tại đây...",
  },
  {
    label: "**Đậm**",
    snippet: "**văn bản**",
  },
  {
    label: "📝 Lưu ý",
    snippet: "\n**Lưu ý:** Nhập nội dung ghi chú tại đây.",
  },
];

function QuickInsertBar({ onInsert }) {
  return (
    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#F0DDD5]">
      <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold self-center mr-1">
        Chèn nhanh:
      </span>
      {QUICK_INSERT.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={() => onInsert(btn.snippet)}
          className="text-[11px] px-2.5 py-1 rounded-lg border border-[#F0DDD5] bg-[#FFFAF8] text-stone-500 hover:border-[#C85C3C]/40 hover:text-[#C85C3C] font-bold transition-all"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────

function TabSwitcher({ tab, setTab }) {
  return (
    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
      {[
        { key: "edit", label: "Nhập", Icon: PenLine },
        { key: "preview", label: "Xem trước", Icon: Eye },
      ].map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => setTab(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            tab === key
              ? "bg-white text-[#C85C3C] shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          <Icon size={11} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DescriptionEditor({ value = "", onChange }) {
  const [tab, setTab] = useState("edit");

  // Chèn snippet vào cuối textarea
  const handleInsert = (snippet) => {
    onChange(value + snippet);
  };

  return (
    <Card className="border-[#F0DDD5]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-black text-[#2C1810] uppercase tracking-widest">
            Mô tả sản phẩm
          </CardTitle>
          <TabSwitcher tab={tab} setTab={setTab} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tab === "edit" ? (
          <>
            <QuickInsertBar onInsert={handleInsert} />
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={12}
              placeholder={`Nhập mô tả sản phẩm theo định dạng Markdown. Ví dụ:

Hộp quà được tuyển chọn kỹ lưỡng từ các làng nghề truyền thống.

## Sản phẩm trong hộp:

- **Trà sen Tây Hồ x 2:** Hương thơm thanh khiết, thu hái thủ công mỗi sáng sớm tháng 8.
- **Kẹo dừa Bến Tre x 3:** Vị ngọt tự nhiên, không chất bảo quản, đóng gói thủ công.

**Lưu ý:** Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp.`}
              className="w-full bg-[#FFFAF8] border border-[#F0DDD5] rounded-xl px-3.5 py-3 text-sm text-[#2C1810] placeholder-stone-300 focus:outline-none focus:border-[#C85C3C] focus:ring-2 focus:ring-[#C85C3C]/10 transition-all resize-none font-mono leading-relaxed"
            />
            <p className="text-[10px] text-stone-400">
              Hỗ trợ Markdown:{" "}
              <code className="bg-stone-100 px-1 rounded">**đậm**</code> ·{" "}
              <code className="bg-stone-100 px-1 rounded">## tiêu đề</code> ·{" "}
              <code className="bg-stone-100 px-1 rounded">- danh sách</code>
            </p>
          </>
        ) : (
          <div className="min-h-60 border border-[#F0DDD5] rounded-xl bg-[#FFFAF8] p-5">
            {value?.trim() ? (
              <ProductDescription markdown={value} />
            ) : (
              <p className="text-sm text-stone-300 italic text-center mt-10">
                Chưa có nội dung để xem trước
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
