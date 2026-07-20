"use client";

/**
 * RichTextEditor.jsx
 * Rich text editor dùng chung cho các form admin (mô tả sản phẩm, mô tả box, blog...).
 *
 * - Dựa trên Tiptap v3 (@tiptap/react + @tiptap/starter-kit)
 * - Output: HTML string (value/onChange) — thay thế hoàn toàn cho <Textarea> cũ.
 * - Tự chứa toolbar riêng (không phụ thuộc shadcn Toggle/Separator) để dùng được
 *   ở mọi trang admin dù trang đó đang dùng shadcn UI hay bộ ui/index.jsx tự chế.
 *
 * Cách dùng:
 *   <RichTextEditor
 *     value={form.description}
 *     onChange={(html) => setForm((p) => ({ ...p, description: html }))}
 *     placeholder="Mô tả chi tiết sản phẩm..."
 *   />
 */

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Link2Off,
  Heading2,
  Heading3,
  Pilcrow,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Nút toolbar dùng chung ─────────────────────────────────────────────────
function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // giữ focus trong editor khi bấm nút
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        active &&
          "bg-[#C85C3C]/10 text-[#C85C3C] hover:bg-[#C85C3C]/15 dark:bg-[#C85C3C]/20",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  minHeight = 200,
  error,
  className,
}) {
  const editor = useEditor({
    immediatelyRender: false, // bắt buộc với Next.js để tránh lệch hydration SSR/CSR
    shouldRerenderOnTransaction: true, // để toolbar cập nhật trạng thái active theo con trỏ
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: "text-[#C85C3C] underline underline-offset-2",
          },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "totmart-editor-content prose prose-sm max-w-none focus:outline-none min-h-[var(--min-h)] px-3.5 py-3 text-sm leading-relaxed",
        style: `--min-h: ${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange?.(html);
    },
  });

  // Đồng bộ khi value bị set từ bên ngoài (VD: load dữ liệu box/product khi vào trang update)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && next !== (editor.isEmpty ? "" : current)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL liên kết:", previousUrl || "https://");
    if (url === null) return; // bấm Cancel
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 animate-pulse",
          className,
        )}
        style={{ minHeight: minHeight + 48 }}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-white dark:bg-gray-900 overflow-hidden transition-colors",
        error
          ? "border-red-400"
          : "border-gray-200 dark:border-gray-700 focus-within:border-[#C85C3C]/50 focus-within:ring-2 focus-within:ring-[#C85C3C]/10",
        className,
      )}
    >
      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40">
        <ToolbarButton
          title="Đoạn văn thường"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Tiêu đề lớn"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Tiêu đề nhỏ"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="In đậm (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="In nghiêng (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Gạch chân (Ctrl+U)"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Gạch ngang"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Danh sách dấu chấm"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Danh sách đánh số"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Trích dẫn"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Chèn liên kết"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Gỡ liên kết"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Hoàn tác (Ctrl+Z)"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Làm lại (Ctrl+Y)"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={15} />
        </ToolbarButton>
      </div>

      {/* ─── Vùng soạn thảo ─── */}
      <EditorContent editor={editor} />

      {error && (
        <p className="text-xs text-red-500 px-3.5 pb-2.5 -mt-1">{error}</p>
      )}
    </div>
  );
}

export default RichTextEditor;
