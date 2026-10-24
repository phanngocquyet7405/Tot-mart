const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Đọc source và xác minh TUYỆT ĐỐI KHÔNG DÙNG REGEX trong htmlSanitizer.js
const sanitizerCode = fs.readFileSync(
  path.resolve(__dirname, "../src/app/util/htmlSanitizer.js"),
  "utf8"
);

test("htmlSanitizer: Zero Regular Expression verification", () => {
  // Loại bỏ comments trước khi kiểm tra ký hiệu regex
  const strippedCode = sanitizerCode
    .split("\n")
    .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
    .join("\n");

  assert.equal(
    strippedCode.includes("RegExp"),
    false,
    "htmlSanitizer.js must not instantiate or reference RegExp"
  );
  assert.equal(
    strippedCode.includes(".match("),
    false,
    "htmlSanitizer.js must not call .match()"
  );
  assert.equal(
    strippedCode.includes(".search("),
    false,
    "htmlSanitizer.js must not call .search()"
  );
  assert.equal(
    strippedCode.includes(".test("),
    false,
    "htmlSanitizer.js must not call .test()"
  );
});

// Import module
async function getSanitizer() {
  return await import("../src/app/util/htmlSanitizer.js");
}

test("htmlSanitizer: Strips classic <script> and dangerous tags completely", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const scriptAttack = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
  const clean = sanitizeHtml(scriptAttack);
  assert.equal(clean, "<p>Hello</p><p>World</p>");
  assert.equal(clean.includes("script"), false);
  assert.equal(clean.includes("alert"), false);

  const styleAttack = '<style>body { display: none; }</style><p>Content</p>';
  assert.equal(sanitizeHtml(styleAttack), "<p>Content</p>");

  const iframeAttack = '<iframe src="https://attacker.example/evil"></iframe><p>Safe</p>';
  assert.equal(sanitizeHtml(iframeAttack), "<p>Safe</p>");
});

test("htmlSanitizer: Strips inline event handlers (onerror, onclick, onload, etc.)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const imgAttack = '<img src="https://images.unsplash.com/photo.jpg" onerror="alert(1)" alt="Cover" />';
  const sanitizedImg = sanitizeHtml(imgAttack);
  assert.equal(sanitizedImg.includes("onerror"), false);
  assert.equal(sanitizedImg.includes("alert"), false);
  assert.equal(sanitizedImg.includes('src="https://images.unsplash.com/photo.jpg"'), true);
  assert.equal(sanitizedImg.includes('alt="Cover"'), true);

  const svgAttack = '<svg onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>';
  assert.equal(sanitizeHtml(svgAttack), "");

  const buttonAttack = '<button onclick="evilAction()">Click</button>';
  assert.equal(sanitizeHtml(buttonAttack), "Click"); // Thẻ button bị loại bỏ, text an toàn được giữ
});

test("htmlSanitizer: Blocks dangerous URL protocols (javascript, data, vbscript, etc.)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  // javascript: scheme
  const jsLink = '<a href="javascript:alert(1)">Click Me</a>';
  assert.equal(sanitizeHtml(jsLink), "<a>Click Me</a>");

  // data: scheme (XSS via data URI)
  const dataLink = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Click</a>';
  assert.equal(sanitizeHtml(dataLink), "<a>Click</a>");

  // vbscript: scheme
  const vbLink = '<a href="vbscript:msgbox(1)">Click</a>';
  assert.equal(sanitizeHtml(vbLink), "<a>Click</a>");

  // Evasion: spaces and control characters in protocol
  const spacedJs = '<a href="jav&#x09;ascript:alert(1)">Click</a>';
  assert.equal(sanitizeHtml(spacedJs).includes("alert"), false);

  const nullByteJs = '<a href="java\0script:alert(1)">Click</a>';
  assert.equal(sanitizeHtml(nullByteJs), "<a>Click</a>");
});

test("htmlSanitizer: Automatically enforces rel='noopener noreferrer' on target='_blank'", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const extLink = '<a href="https://totmart.vn/policy" target="_blank">Chính sách</a>';
  const cleanLink = sanitizeHtml(extLink);
  assert.equal(cleanLink.includes('target="_blank"'), true);
  assert.equal(cleanLink.includes('rel="noopener noreferrer"'), true);
});

test("htmlSanitizer: Preserves valid rich-text formatting and structures without corruption", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const richText = `
    <h2>Mô tả sản phẩm hữu cơ</h2>
    <p class="lead">Sản phẩm <strong>100% tự nhiên</strong> từ nông trại Đà Lạt.</p>
    <ul>
      <li>Không chất bảo quản</li>
      <li>Chứng nhận VietGAP</li>
    </ul>
    <p>Chi tiết xem tại <a href="/categories/rau-cu">Danh mục Rau Củ</a>.</p>
    <img src="https://res.cloudinary.com/demo/image/upload/v1/sample.jpg" alt="Rau xanh" width="400" height="300" />
  `.trim();

  const result = sanitizeHtml(richText);

  // Thẻ tiêu đề & định dạng được giữ nguyên
  assert.equal(result.includes("<h2>Mô tả sản phẩm hữu cơ</h2>"), true);
  assert.equal(result.includes("<strong>100% tự nhiên</strong>"), true);
  assert.equal(result.includes("<ul>"), true);
  assert.equal(result.includes("<li>Không chất bảo quản</li>"), true);
  assert.equal(result.includes('<a href="/categories/rau-cu">Danh mục Rau Củ</a>'), true);
  assert.equal(result.includes('src="https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"'), true);
  assert.equal(result.includes('alt="Rau xanh"'), true);
});

test("htmlSanitizer: Gracefully handles null, empty, malformed and non-string inputs", async () => {
  const { sanitizeHtml } = await getSanitizer();

  assert.equal(sanitizeHtml(null), "");
  assert.equal(sanitizeHtml(undefined), "");
  assert.equal(sanitizeHtml(""), "");
  assert.equal(sanitizeHtml(123), "");
  assert.equal(sanitizeHtml("<"), "&lt;");
  assert.equal(sanitizeHtml("<>"), "&lt;>");
  assert.equal(sanitizeHtml("<p>Unclosed paragraph"), "<p>Unclosed paragraph");
});
