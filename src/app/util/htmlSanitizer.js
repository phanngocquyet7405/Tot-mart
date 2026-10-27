import sanitizeHtmlLib from "sanitize-html";

/**
 * htmlSanitizer.js
 *
 * Bộ lọc phòng thủ XSS cho TotMart FE dựa trên thư viện chuẩn công nghiệp sanitize-html.
 * Cấu hình bảo mật nghiêm ngặt:
 * - Loại bỏ toàn bộ style attribute (bỏ style).
 * - Loại bỏ class ngoại trừ prefix của TipTap/ProseMirror (bỏ class).
 * - allowedSchemesByTag: thẻ img chỉ cho phép http/https (chặn data:, javascript:, file:).
 * - allowProtocolRelative: false (chặn URL //evil.com).
 * - Tự động bổ sung rel="noopener noreferrer" cho thẻ a có target="_blank".
 */

const SANITIZE_OPTIONS = {
  allowedTags: [
    "p", "br", "hr",
    "strong", "b", "em", "i", "u", "s", "strike", "del", "sub", "sup",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "span", "div",
    "table", "thead", "tbody", "tr", "th", "td",
    "a", "img"
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan", "align"],
    td: ["colspan", "rowspan", "align"],
    ol: ["start", "type"],
  },
  // Bỏ class thông thường, chỉ cho phép prefix cụ thể nếu TipTap thật sự cần
  allowedClasses: {
    "*": [/^tiptap-/, /^ProseMirror-/],
  },
  // Bỏ hoàn toàn style attribute
  allowedStyles: {},
  // Thẻ img chỉ cho phép giao thức http và https
  allowedSchemesByTag: {
    img: ["http", "https"],
    a: ["http", "https", "mailto", "tel"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Cấm protocol-relative URL (vd: //evil.com)
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") {
        attribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs };
    },
  },
};

/**
 * Làm sạch chuỗi HTML đầu vào.
 * @param {string} dirty HTML chưa kiểm duyệt
 * @returns {string} HTML an toàn
 */
export function sanitizeHtml(dirty) {
  if (typeof dirty !== "string" || !dirty) {
    return "";
  }
  return sanitizeHtmlLib(dirty, SANITIZE_OPTIONS);
}

export default sanitizeHtml;
