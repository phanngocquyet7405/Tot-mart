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

  const styleAttack = "<style>body { display: none; }</style><p>Content</p>";
  assert.equal(sanitizeHtml(styleAttack), "<p>Content</p>");

  const iframeAttack =
    '<iframe src="https://attacker.example/evil"></iframe><p>Safe</p>';
  assert.equal(sanitizeHtml(iframeAttack), "<p>Safe</p>");
});

test("htmlSanitizer: Strips inline event handlers and non-http img schemes", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const imgAttack =
    '<img src="https://images.unsplash.com/photo.jpg" onerror="alert(1)" alt="Cover" />';
  const sanitizedImg = sanitizeHtml(imgAttack);
  assert.equal(sanitizedImg.includes("onerror"), false);
  assert.equal(sanitizedImg.includes("alert"), false);
  assert.equal(
    sanitizedImg.includes('src="https://images.unsplash.com/photo.jpg"'),
    true,
  );
  assert.equal(sanitizedImg.includes('alt="Cover"'), true);

  // img chỉ cho phép http/https; data: và javascript: bị chặn
  const imgDataAttack =
    '<img src="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+" />';
  const cleanImgData = sanitizeHtml(imgDataAttack);
  assert.equal(cleanImgData.includes("data:"), false);

  const svgAttack =
    '<svg onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>';
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
  const dataLink =
    '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Click</a>';
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

  const input =
    '<p class="tiptap-lead ProseMirror-selectednode custom-bad-class" style="color: red; font-size: 50px;">Nội dung</p>';
  const clean = sanitizeHtml(input);

  assert.equal(clean.includes("style="), false);
  assert.equal(clean.includes("custom-bad-class"), false);
  assert.equal(clean.includes("tiptap-lead"), true);
  assert.equal(clean.includes("ProseMirror-selectednode"), true);
});

test("htmlSanitizer: Automatically enforces rel='noopener noreferrer' on target='_blank'", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const extLink =
    '<a href="https://totmart.vn/policy" target="_blank">Chính sách</a>';
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

  assert.equal(
    cleaned.includes('<h2 class="tiptap-heading">Hộp Quà Đặc Sản Tây Bắc</h2>'),
    true,
  );
  assert.equal(cleaned.includes("<strong>hợp tác xã bản địa</strong>"), true);
  assert.equal(
    cleaned.includes(
      "<blockquote>Hương vị nguyên bản từ núi rừng Hoàng Liên Sơn.</blockquote>",
    ),
    true,
  );
  assert.equal(cleaned.includes("<ul>"), true);
  assert.equal(
    cleaned.includes("<pre><code>MÃ_SẢN_PHẨM: TB-GIFT-2026</code></pre>"),
    true,
  );
  assert.equal(cleaned.includes('rel="noopener noreferrer"'), true);
  assert.equal(cleaned.includes('href="mailto:support@totmart.vn"'), true);
  assert.equal(
    cleaned.includes('src="https://images.unsplash.com/photo-taybac.jpg"'),
    true,
  );
});

test("htmlSanitizer: Gracefully handles null, empty, malformed and non-string inputs", async () => {
  const { sanitizeHtml } = await getSanitizer();

  assert.equal(sanitizeHtml(null), "");
  assert.equal(sanitizeHtml(undefined), "");
  assert.equal(sanitizeHtml(""), "");
  assert.equal(sanitizeHtml(123), "");
  assert.equal(sanitizeHtml("<"), "&lt;");
  assert.equal(
    sanitizeHtml("<p>Unclosed paragraph"),
    "<p>Unclosed paragraph</p>",
  );
});

// ==============================================================================
// 8 NHÓM PAYLOAD BẢO MẬT BỔ SUNG (Phase F-FIX2 Requirement)
// ==============================================================================

test("htmlSanitizer: Nhóm 1 - Giao thức mã hóa thực thể (Entity-encoded protocols)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const entityHex = '<a href="jav&#x09;ascript:alert(1)">Link 1</a>';
  assert.equal(sanitizeHtml(entityHex).includes("javascript"), false);
  assert.equal(sanitizeHtml(entityHex), "<a>Link 1</a>");

  const entityDec =
    '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(2)">Link 2</a>';
  assert.equal(sanitizeHtml(entityDec).includes("alert"), false);
  assert.equal(sanitizeHtml(entityDec), "<a>Link 2</a>");

  const entityTab = '<a href="&Tab;javascript:alert(3)">Link 3</a>';
  assert.equal(sanitizeHtml(entityTab).includes("alert"), false);
});

test("htmlSanitizer: Nhóm 2 - Ký tự điều khiển trong protocol (Control characters)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const nullByte = '<a href="java\0script:alert(1)">Null byte link</a>';
  assert.equal(sanitizeHtml(nullByte).includes("alert"), false);
  assert.equal(sanitizeHtml(nullByte), "<a>Null byte link</a>");

  const newlineProtocol = '<a href="jav\r\nascript:alert(1)">Newline link</a>';
  assert.equal(sanitizeHtml(newlineProtocol).includes("alert"), false);

  const ctrlChar = '<a href="java\x01script:alert(1)">Control char link</a>';
  assert.equal(sanitizeHtml(ctrlChar).includes("alert"), false);
});

test("htmlSanitizer: Nhóm 3 - Thẻ không đóng và cú pháp dở dang (Unclosed tags)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const unclosedImg = "<img src=x onerror=alert(1)";
  const cleanedImg = sanitizeHtml(unclosedImg);
  assert.equal(cleanedImg.includes("onerror"), false);
  assert.equal(cleanedImg.includes("alert"), false);

  const unclosedIframe = '<iframe src="https://evil.com"';
  assert.equal(sanitizeHtml(unclosedIframe), "");

  const unclosedBold = "<b onmouseover=alert(1) unclosed text";
  const cleanedBold = sanitizeHtml(unclosedBold);
  assert.equal(cleanedBold.includes("onmouseover"), false);
  assert.equal(cleanedBold.includes("alert"), false);

  const unclosedPara =
    "<p onmouseover=alert(1)>Nội dung dở dang không đóng thẻ";
  const cleanedPara = sanitizeHtml(unclosedPara);
  assert.equal(cleanedPara.includes("onmouseover"), false);
  assert.equal(cleanedPara.includes("alert"), false);
  assert.equal(cleanedPara, "<p>Nội dung dở dang không đóng thẻ</p>");
});

test("htmlSanitizer: Nhóm 4 - Vectors SVG và MathML (svg/math)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const mathMl =
    '<math><mtext><mglyph src="x" onerror="alert(1)"></mglyph></mtext></math>';
  assert.equal(sanitizeHtml(mathMl).includes("mglyph"), false);
  assert.equal(sanitizeHtml(mathMl).includes("alert"), false);

  const svgAnimate =
    '<svg><animate onbegin="alert(1)" attributeName="x" dur="1s"/></svg>';
  assert.equal(sanitizeHtml(svgAnimate), "");

  const svgSet = '<svg><set attributeName="onmouseover" to="alert(1)"/></svg>';
  assert.equal(sanitizeHtml(svgSet), "");
});

test("htmlSanitizer: Nhóm 5 - Mutation XSS (mXSS vectors)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const mXssNoscript =
    '<noscript><p title="</noscript><img src=x onerror=alert(1)>">';
  const cleanNoscript = sanitizeHtml(mXssNoscript);
  assert.equal(cleanNoscript.includes("onerror"), false);
  assert.equal(cleanNoscript.includes("alert"), false);

  const mXssListing = "<listing><img src=x onerror=alert(1)></listing>";
  const cleanListing = sanitizeHtml(mXssListing);
  assert.equal(cleanListing.includes("onerror"), false);
  assert.equal(cleanListing.includes("listing"), false);
});

test("htmlSanitizer: Nhóm 6 - Toàn bộ các biến thể On* event handlers", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const events = [
    '<p onfocus="alert(1)" tabindex="1">Focus</p>',
    '<p onanimationstart="alert(1)">Anim</p>',
    '<p ontoggle="alert(1)">Toggle</p>',
    '<p onpointerdown="alert(1)">Pointer</p>',
    '<p onmouseover="alert(1)">Hover</p>',
  ];

  for (const ev of events) {
    const clean = sanitizeHtml(ev);
    assert.equal(clean.includes("alert"), false);
    assert.equal(clean.includes("on"), false);
  }
});

test("htmlSanitizer: Nhóm 7 - Thuộc tính srcset độc hại", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const imgWithBadSrcset =
    '<img src="https://totmart.vn/img.jpg" srcset="javascript:alert(1) 1x, data:image/svg+xml,... 2x" alt="Test" />';
  const clean = sanitizeHtml(imgWithBadSrcset);
  assert.equal(clean.includes("javascript"), false);
  assert.equal(clean.includes("alert"), false);
  assert.equal(clean.includes("data:"), false);
});

test("htmlSanitizer: Nhóm 8 - Protocol-relative URLs (//attacker.example)", async () => {
  const { sanitizeHtml } = await getSanitizer();

  const protoRelativeLink =
    '<a href="//attacker.example/malicious.html">Dangerous link</a>';
  assert.equal(
    sanitizeHtml(protoRelativeLink).includes("//attacker.example"),
    false,
  );

  const protoRelativeImg =
    '<img src="//attacker.example/tracker.png" alt="Tracker" />';
  assert.equal(
    sanitizeHtml(protoRelativeImg).includes("//attacker.example"),
    false,
  );
});
