/**
 * htmlSanitizer.js
 *
 * Bộ lọc phòng thủ XSS cho TotMart FE (Phase F04).
 * TUYỆT ĐỐI KHÔNG DÙNG REGEX (Zero Regular Expression), hoạt động dựa trên
 * Deterministic State Machine Parser tuần tự ký tự (Deterministic Finite State Automaton).
 * Hoạt động tương thích hoàn toàn trên cả Node.js (SSR, Unit Test) và Browser.
 */

// ─── Danh mục Allowlist Thẻ & Thuộc tính ────────────────────────────────────

const ALLOWED_TAGS = new Set([
  "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "strike", "del", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "span", "div",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "img"
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

// Các thẻ nguy hiểm bắt buộc nuốt sạch toàn bộ nội dung con bên trong
const DANGEROUS_RAW_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "noscript", "template", "svg", "math"
]);

const GLOBAL_ALLOWED_ATTRS = new Set([
  "class", "id", "title", "alt", "width", "height", "align", "dir", "lang"
]);

const TAG_SPECIFIC_ATTRS = {
  a: new Set(["href", "target", "rel", "title"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  th: new Set(["colspan", "rowspan", "align", "valign"]),
  td: new Set(["colspan", "rowspan", "align", "valign"]),
  ol: new Set(["start", "type"]),
};

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

// ─── Hàm bổ trợ kiểm tra chuỗi (KHÔNG DÙNG REGEX) ───────────────────────────

/**
 * Loại bỏ ký tự điều khiển (ASCII 0-31, 127) và khoảng trắng (spaces, tabs, newlines)
 * nhằm ngăn chặn kỹ thuật bypass protocol dạng "java\0script:", "j a v a s c r i p t :"
 */
function stripControlAndWhitespace(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Bỏ qua ASCII control characters (< 32), DEL (127), và khoảng trắng thông thường
    if (code > 32 && code !== 127) {
      result += str[i];
    }
  }
  return result;
}

/**
 * Kiểm tra URL an toàn: chỉ cho phép http, https, mailto, tel hoặc đường dẫn tương đối.
 * Chặn đứng tuyệt đối javascript:, data:, vbscript:, file:, etc.
 */
export function isSafeUrl(rawUrl) {
  if (typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) return false;

  // Đường dẫn tương đối an toàn
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("?")
  ) {
    return true;
  }

  // Chuẩn hóa loại bỏ khoảng trắng và ký tự điều khiển
  const normalized = stripControlAndWhitespace(trimmed).toLowerCase();

  // Tìm dấu phân tách scheme ':'
  const colonIndex = normalized.indexOf(":");
  if (colonIndex === -1) {
    // Không có dấu hai chấm -> đường dẫn tương đối (vd: "assets/image.png")
    return true;
  }

  // Tách scheme (vd: "https:")
  const scheme = normalized.slice(0, colonIndex + 1);
  return ALLOWED_PROTOCOLS.has(scheme);
}

/**
 * Thoát ký tự an toàn cho giá trị thuộc tính HTML (KHÔNG DÙNG REGEX)
 */
function escapeAttribute(val) {
  return String(val)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function isWhitespaceChar(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f";
}

function isLetterChar(ch) {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

// ─── Deterministic State Machine Parser ──────────────────────────────────────

/**
 * Sanitize chuỗi HTML đầu vào theo Allowlist nghiêm ngặt.
 *
 * @param {string} input - Chuỗi HTML thô cần lọc.
 * @returns {string} Chuỗi HTML đã lọc an toàn.
 */
export function sanitizeHtml(input) {
  if (!input || typeof input !== "string") return "";

  const len = input.length;
  let cursor = 0;
  let output = "";

  while (cursor < len) {
    const char = input[cursor];

    if (char === "<") {
      const tagStartIndex = cursor;
      cursor++; // Bỏ qua '<'

      if (cursor >= len) {
        output += "&lt;";
        break;
      }

      // 1. Kiểm tra Comment <!-- ... -->
      if (input[cursor] === "!") {
        if (
          cursor + 2 < len &&
          input[cursor + 1] === "-" &&
          input[cursor + 2] === "-"
        ) {
          // Bỏ qua comment hoàn toàn cho đến '-->'
          cursor += 3;
          const endComment = input.indexOf("-->", cursor);
          if (endComment === -1) {
            cursor = len; // Comment không đóng
          } else {
            cursor = endComment + 3;
          }
          continue;
        } else {
          // Bogus comment <! ... >
          const endBogus = input.indexOf(">", cursor);
          cursor = endBogus === -1 ? len : endBogus + 1;
          continue;
        }
      }

      // 2. Kiểm tra Thẻ đóng </tag>
      const isClosing = input[cursor] === "/";
      if (isClosing) {
        cursor++; // Bỏ qua '/'
        while (cursor < len && isWhitespaceChar(input[cursor])) cursor++;
      }

      // 3. Đọc tên thẻ (Tag Name)
      let tagName = "";
      while (cursor < len) {
        const c = input[cursor];
        if (
          isWhitespaceChar(c) ||
          c === "/" ||
          c === ">"
        ) {
          break;
        }
        tagName += c;
        cursor++;
      }

      tagName = tagName.toLowerCase();

      // Nếu không phải tên thẻ hợp lệ (vd: "< "), coi như văn bản thường
      if (tagName.length === 0 || !isLetterChar(tagName[0])) {
        output += "&lt;";
        cursor = tagStartIndex + 1;
        continue;
      }

      // 4. Nếu là thẻ nguy hiểm (script, style, etc.), nuốt sạch nội dung tới thẻ đóng
      if (DANGEROUS_RAW_TAGS.has(tagName) && !isClosing) {
        // Tìm thẻ đóng tương ứng </tagName>
        const closeSequence = "</" + tagName;
        const lowerInput = input.toLowerCase();
        const closePos = lowerInput.indexOf(closeSequence, cursor);
        if (closePos === -1) {
          cursor = len; // Nuốt hết tới cuối chuỗi
        } else {
          const endTagClose = input.indexOf(">", closePos);
          cursor = endTagClose === -1 ? len : endTagClose + 1;
        }
        continue;
      }

      // 5. Nếu là thẻ đóng </tag>
      if (isClosing) {
        while (cursor < len && input[cursor] !== ">") cursor++;
        if (cursor < len && input[cursor] === ">") cursor++;

        if (ALLOWED_TAGS.has(tagName) && !VOID_TAGS.has(tagName)) {
          output += "</" + tagName + ">";
        }
        continue;
      }

      // 6. Đọc các thuộc tính (Attributes) cho thẻ mở
      const attributes = {};
      let isSelfClosing = VOID_TAGS.has(tagName);

      while (cursor < len) {
        // Bỏ qua khoảng trắng giữa các thuộc tính
        while (cursor < len && isWhitespaceChar(input[cursor])) cursor++;

        if (cursor >= len) break;
        if (input[cursor] === ">") {
          cursor++;
          break;
        }
        if (input[cursor] === "/") {
          isSelfClosing = true;
          cursor++;
          while (cursor < len && isWhitespaceChar(input[cursor])) cursor++;
          if (cursor < len && input[cursor] === ">") {
            cursor++;
            break;
          }
          continue;
        }

        // Đọc tên thuộc tính
        let attrName = "";
        while (cursor < len) {
          const c = input[cursor];
          if (
            isWhitespaceChar(c) ||
            c === "=" ||
            c === "/" ||
            c === ">"
          ) {
            break;
          }
          attrName += c;
          cursor++;
        }

        attrName = attrName.toLowerCase();

        // Bỏ qua khoảng trắng sau tên thuộc tính
        while (cursor < len && isWhitespaceChar(input[cursor])) cursor++;

        let attrVal = "";
        let hasVal = false;

        if (cursor < len && input[cursor] === "=") {
          hasVal = true;
          cursor++; // Bỏ qua '='
          while (cursor < len && isWhitespaceChar(input[cursor])) cursor++;

          if (cursor < len) {
            const quote = input[cursor];
            if (quote === '"' || quote === "'") {
              cursor++; // Bỏ qua quote mở
              const valStart = cursor;
              while (cursor < len && input[cursor] !== quote) cursor++;
              attrVal = input.slice(valStart, cursor);
              if (cursor < len && input[cursor] === quote) cursor++; // Bỏ qua quote đóng
            } else {
              // Thuộc tính không có ngoặc kép
              const valStart = cursor;
              while (
                cursor < len &&
                !isWhitespaceChar(input[cursor]) &&
                input[cursor] !== ">"
              ) {
                cursor++;
              }
              attrVal = input.slice(valStart, cursor);
            }
          }
        }

        if (attrName.length > 0) {
          attributes[attrName] = hasVal ? attrVal : "";
        }
      }

      // 7. Lọc và cấu trúc lại thẻ an toàn
      if (ALLOWED_TAGS.has(tagName)) {
        let tagHtml = "<" + tagName;
        const allowedForThisTag = TAG_SPECIFIC_ATTRS[tagName];

        let hasTargetBlank = false;
        let explicitRel = "";

        for (const [name, val] of Object.entries(attributes)) {
          // Bỏ qua mọi thuộc tính sự kiện (on*)
          if (name.startsWith("on")) continue;

          // Kiểm tra quyền hạn thuộc tính
          const isAllowed =
            GLOBAL_ALLOWED_ATTRS.has(name) ||
            (allowedForThisTag && allowedForThisTag.has(name));

          if (!isAllowed) continue;

          // Thẩm tra giao thức cho các thuộc tính URL
          if (name === "href" || name === "src") {
            if (!isSafeUrl(val)) continue; // Loại bỏ thuộc tính URL độc hại
          }

          if (tagName === "a" && name === "target" && val.toLowerCase() === "_blank") {
            hasTargetBlank = true;
          }

          if (tagName === "a" && name === "rel") {
            explicitRel = val;
          }

          tagHtml += " " + name + '="' + escapeAttribute(val) + '"';
        }

        // Bắt buộc thêm rel="noopener noreferrer" nếu target="_blank"
        if (tagName === "a" && hasTargetBlank) {
          if (!tagHtml.includes(' rel="')) {
            tagHtml += ' rel="noopener noreferrer"';
          } else {
            // Đảm bảo có noopener và noreferrer
            let safeRel = explicitRel;
            if (!safeRel.includes("noopener")) safeRel += (safeRel ? " " : "") + "noopener";
            if (!safeRel.includes("noreferrer")) safeRel += (safeRel ? " " : "") + "noreferrer";
            // Cập nhật rel
            tagHtml = tagHtml.replace(
              'rel="' + escapeAttribute(explicitRel) + '"',
              'rel="' + escapeAttribute(safeRel) + '"'
            );
          }
        }

        if (VOID_TAGS.has(tagName)) {
          tagHtml += " />";
        } else {
          tagHtml += ">";
        }

        output += tagHtml;
      }
    } else {
      output += char;
      cursor++;
    }
  }

  return output;
}
