const { test } = require("node:test");
const assert = require("node:assert/strict");

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

test("htmlSanitizer: Strips inline event handlers and non-http img schemes", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const imgAttack = '<img src="https://images.unsplash.com/photo.jpg" onerror="alert(1)" alt="Cover" />';
  const sanitizedImg = sanitizeHtml(imgAttack);
  assert.equal(sanitizedImg.includes("onerror"), false);
  assert.equal(sanitizedImg.includes("alert"), false);
  assert.equal(sanitizedImg.includes('src="https://images.unsplash.com/photo.jpg"'), true);
  assert.equal(sanitizedImg.includes('alt="Cover"'), true);

  // img chỉ cho phép http/https; data: và javascript: bị chặn
  const imgDataAttack = '<img src="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+" />';
  const cleanImgData = sanitizeHtml(imgDataAttack);
  assert.equal(cleanImgData.includes("data:"), false);

  const svgAttack = '<svg onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>';
  assert.equal(sanitizeHtml(svgAttack), "");

  const buttonAttack = '<button onclick="evilAction()">Click</button>';
  assert.equal(sanitizeHtml(buttonAttack), "Click");
});

test("htmlSanitizer: Blocks dangerous URL protocols and protocol-relative URLs", async () => {
  const { sanitizeHtml } = await getSanitizer();

  // javascript: scheme
  const jsLink = '<a href="javascript:alert(1)">Click Me</a>';
  assert.equal(sanitizeHtml(jsLink), "<a>Click Me</a>");

  // data: scheme
  const dataLink = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Click</a>';
  assert.equal(sanitizeHtml(dataLink), "<a>Click</a>");

  // vbscript: scheme
  const vbLink = '<a href="vbscript:msgbox(1)">Click</a>';
  assert.equal(sanitizeHtml(vbLink), "<a>Click</a>");

  // Protocol-relative URL (allowProtocolRelative: false)
  const protoRelative = '<a href="//evil.com/xss">Evil</a>';
  const cleanProto = sanitizeHtml(protoRelative);
  assert.equal(cleanProto.includes("//evil.com"), false);
});

test("htmlSanitizer: Bỏ class tùy ý và style, chỉ giữ class có prefix TipTap/ProseMirror", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const input = '<p class="tiptap-lead ProseMirror-selectednode custom-bad-class" style="color: red; font-size: 50px;">Nội dung</p>';
  const clean = sanitizeHtml(input);

  assert.equal(clean.includes('style='), false);
  assert.equal(clean.includes('custom-bad-class'), false);
  assert.equal(clean.includes('tiptap-lead'), true);
  assert.equal(clean.includes('ProseMirror-selectednode'), true);
});

test("htmlSanitizer: Automatically enforces rel='noopener noreferrer' on target='_blank'", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const extLink = '<a href="https://totmart.vn/policy" target="_blank">Chính sách</a>';
  const cleanLink = sanitizeHtml(extLink);
  assert.equal(cleanLink.includes('target="_blank"'), true);
  assert.equal(cleanLink.includes('rel="noopener noreferrer"'), true);
});

test("htmlSanitizer: Test với HTML TipTap thật", async () => {
  const { sanitizeHtml } = await getSanitizer();

  // Mẫu HTML TipTap xuất bản thực tế từ RichTextEditor
  const realTipTapHtml = `
    <h2 class="tiptap-heading">Hộp Quà Đặc Sản Tây Bắc</h2>
    <p>Sản phẩm được tuyển chọn thủ công từ các <strong>hợp tác xã bản địa</strong>.</p>
    <blockquote>Hương vị nguyên bản từ núi rừng Hoàng Liên Sơn.</blockquote>
    <ul>
      <li><p>Chè Shan Tuyết cổ thụ 100g</p></li>
      <li><p>Mật ong hoa rừng tự nhiên 250ml</p></li>
      <li><p>Thịt trâu gác bếp sấy củi nhãn 300g</p></li>
    </ul>
    <pre><code>MÃ_SẢN_PHẨM: TB-GIFT-2026</code></pre>
    <p>Chi tiết liên hệ: <a href="https://totmart.vn/lien-he" target="_blank">TotMart Hotline</a> hoặc email <a href="mailto:support@totmart.vn">support@totmart.vn</a>.</p>
    <img src="https://images.unsplash.com/photo-taybac.jpg" alt="Đặc sản Tây Bắc" width="600" height="400" />
  `.trim();

  const cleaned = sanitizeHtml(realTipTapHtml);

  assert.equal(cleaned.includes('<h2 class="tiptap-heading">Hộp Quà Đặc Sản Tây Bắc</h2>'), true);
  assert.equal(cleaned.includes('<strong>hợp tác xã bản địa</strong>'), true);
  assert.equal(cleaned.includes('<blockquote>Hương vị nguyên bản từ núi rừng Hoàng Liên Sơn.</blockquote>'), true);
  assert.equal(cleaned.includes('<ul>'), true);
  assert.equal(cleaned.includes('<pre><code>MÃ_SẢN_PHẨM: TB-GIFT-2026</code></pre>'), true);
  assert.equal(cleaned.includes('rel="noopener noreferrer"'), true);
  assert.equal(cleaned.includes('href="mailto:support@totmart.vn"'), true);
  assert.equal(cleaned.includes('src="https://images.unsplash.com/photo-taybac.jpg"'), true);
});

test("htmlSanitizer: Gracefully handles null, empty, malformed and non-string inputs", async () => {
  const { sanitizeHtml } = await getSanitizer();

  assert.equal(sanitizeHtml(null), "");
  assert.equal(sanitizeHtml(undefined), "");
  assert.equal(sanitizeHtml(""), "");
  assert.equal(sanitizeHtml(123), "");
  assert.equal(sanitizeHtml("<"), "&lt;");
  assert.equal(sanitizeHtml("<p>Unclosed paragraph"), "<p>Unclosed paragraph</p>");
});
