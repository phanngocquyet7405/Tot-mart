/**
 * Bóc tag HTML khỏi nội dung RichTextEditor (Tiptap) để hiện preview dạng
 * text thuần trong bảng admin — cùng logic với stripHtml() phía client
 * (app/(client)/utils/catalogHelpers.js), tách riêng bản này để admin
 * không phải import chéo qua route group (client).
 */
export function stripHtml(html = "") {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
