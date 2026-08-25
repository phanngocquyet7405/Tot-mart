// app/(client)/utils/catalogHelpers.js
import {
  Leaf,
  Beef,
  Fish,
  Wheat,
  Milk,
  Cookie,
  Soup,
  UtensilsCrossed,
  Coffee,
  Sparkles,
  Home,
  Recycle,
  Shirt,
  Gift,
  Palette,
  Tag,
} from "lucide-react";

function toId(item) {
  if (!item) return null;
  if (typeof item === "string") return item;
  return item.categoryId || item._id || null;
}

function extractRefId(ref) {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return ref._id || null;
}

/**
 * Dựng cây danh mục 2 cấp (root -> subcategories) từ danh sách phẳng
 * có childrenIds, cùng logic với nav_menu.js. Chỉ lấy category active.
 */
export function buildCategoryTree(categories = []) {
  const active = categories.filter((c) => c.isActive !== false);
  const byId = new Map(active.map((c) => [String(c._id), c]));

  const childIdSet = new Set();
  active.forEach((cat) => {
    (cat.childrenIds || []).forEach((child) => {
      const id = toId(child);
      if (id) childIdSet.add(String(id));
    });
  });

  const roots = active.filter((c) => !childIdSet.has(String(c._id)));

  return roots
    .map((root) => {
      const subcategories = (root.childrenIds || [])
        .map((child) => byId.get(String(toId(child))))
        .filter(Boolean)
        .filter((c) => c.isActive !== false)
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));
      return { ...root, subcategories };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

/** Đếm sản phẩm active theo categoryId (chấp nhận cả string lẫn object populate). */
export function countProductsByCategory(products = []) {
  const counts = new Map();
  products.forEach((p) => {
    const id = extractRefId(p.categoryId || p.category);
    if (!id) return;
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  return counts;
}

/** Đếm sản phẩm theo brandId, tương tự countProductsByCategory. */
export function countProductsByBrand(products = []) {
  const counts = new Map();
  products.forEach((p) => {
    const id = extractRefId(p.brandId || p.brand);
    if (!id) return;
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  return counts;
}

/** Tổng sản phẩm của danh mục gốc = số gắn trực tiếp + tổng các danh mục con. */
export function getRootProductTotal(root, countsMap) {
  const own = countsMap.get(String(root._id)) || 0;
  const childrenTotal = (root.subcategories || []).reduce(
    (sum, sub) => sum + (countsMap.get(String(sub._id)) || 0),
    0,
  );
  return own + childrenTotal;
}

// --- Icon + màu theo ngữ nghĩa tên danh mục (schema không có field image) ---

const KEYWORD_VISUALS = [
  { keywords: ["rau", "hữu cơ", "hoa quả", "trái cây"], Icon: Leaf, tint: "sage" },
  { keywords: ["thịt", "trứng"], Icon: Beef, tint: "clay" },
  { keywords: ["hải sản", "thủy sản", "cá"], Icon: Fish, tint: "ocean" },
  { keywords: ["ngũ cốc", "hạt", "mỳ", "gạo"], Icon: Wheat, tint: "wheat" },
  { keywords: ["sữa"], Icon: Milk, tint: "cream" },
  { keywords: ["bánh"], Icon: Cookie, tint: "clay" },
  { keywords: ["gia vị"], Icon: Soup, tint: "terracotta" },
  { keywords: ["chế biến"], Icon: UtensilsCrossed, tint: "terracotta" },
  { keywords: ["đồ uống", "nước"], Icon: Coffee, tint: "sage" },
  { keywords: ["mỹ phẩm", "sức khoẻ", "sức khỏe"], Icon: Sparkles, tint: "rose" },
  { keywords: ["gia dụng", "trang trí"], Icon: Home, tint: "wheat" },
  { keywords: ["môi trường", "tái chế", "xanh"], Icon: Recycle, tint: "sage" },
  { keywords: ["quần áo", "phụ kiện", "thời trang"], Icon: Shirt, tint: "ocean" },
  { keywords: ["quà tặng", "bưu thiếp"], Icon: Gift, tint: "rose" },
  { keywords: ["nghệ thuật", "thủ công", "mỹ nghệ"], Icon: Palette, tint: "clay" },
];

const TINTS = {
  terracotta: "bg-[#C85C3C]/10 text-[#C85C3C] ring-[#C85C3C]/20",
  sage: "bg-[#7A8B6F]/10 text-[#7A8B6F] ring-[#7A8B6F]/20",
  clay: "bg-[#B8683F]/10 text-[#B8683F] ring-[#B8683F]/20",
  wheat: "bg-[#C99A3E]/10 text-[#C99A3E] ring-[#C99A3E]/20",
  ocean: "bg-[#5B8A96]/10 text-[#5B8A96] ring-[#5B8A96]/20",
  rose: "bg-[#C6706F]/10 text-[#C6706F] ring-[#C6706F]/20",
  cream: "bg-[#B8A88A]/10 text-[#8A7A5C] ring-[#8A7A5C]/20",
};
const FALLBACK_TINT_KEYS = Object.keys(TINTS);

/**
 * Trả về { Icon, tintClass } theo từ khoá trong tên danh mục.
 * Không khớp keyword nào -> fallback ổn định theo hash tên (không đổi giữa các lần render).
 */
export function getCategoryVisual(name = "") {
  const lower = name.toLowerCase();
  const match = KEYWORD_VISUALS.find((v) =>
    v.keywords.some((k) => lower.includes(k)),
  );
  if (match) return { Icon: match.Icon, tintClass: TINTS[match.tint] };

  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const tintKey = FALLBACK_TINT_KEYS[Math.abs(hash) % FALLBACK_TINT_KEYS.length];
  return { Icon: Tag, tintClass: TINTS[tintKey] };
}

/** Bóc tag HTML khỏi mô tả brand (RichTextEditor lưu HTML) để hiện preview dạng text. */
export function stripHtml(html = "") {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
