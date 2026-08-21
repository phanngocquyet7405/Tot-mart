import { getAllProductsApi, getAllCategoriesApi, getAllBrandsApi } from "@/app/services/api/productServices";
import { getAllBoxesApi } from "@/app/services/api/boxService";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Trang tĩnh — cập nhật thủ công khi thêm route mới không thuộc dạng động
const STATIC_ROUTES = [
  { path: "/homepage", priority: 1, changeFrequency: "daily" },
  { path: "/products", priority: 0.9, changeFrequency: "daily" },
  { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
  { path: "/brands", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pages/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pages/contact-us", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pages/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pages/news", priority: 0.6, changeFrequency: "weekly" },
  { path: "/pages/offers-discounts-coupons", priority: 0.6, changeFrequency: "weekly" },
];

// Gọi API lỗi thì trả mảng rỗng — 1 nguồn dữ liệu lỗi không nên làm sitemap
// rỗng hoàn toàn, các phần còn lại vẫn nên có trong sitemap.
async function safeFetchList(apiCall) {
  try {
    const res = await apiCall();
    const data = res?.data?.data || res?.data || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const [products, categories, brands, boxes] = await Promise.all([
    safeFetchList(getAllProductsApi),
    safeFetchList(getAllCategoriesApi),
    safeFetchList(getAllBrandsApi),
    safeFetchList(getAllBoxesApi),
  ]);

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const productEntries = products
    .filter((p) => p.isActive !== false)
    .map((p) => ({
      url: `${SITE_URL}/products/${p.slug || "san-pham"}-${p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const categoryEntries = categories
    .filter((c) => c.isActive !== false)
    .map((c) => ({
      url: `${SITE_URL}/categories/${c.slug || c._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const brandEntries = brands
    .filter((b) => b.isActive !== false)
    .map((b) => ({
      url: `${SITE_URL}/brands/${b.slug || b._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const boxEntries = boxes.map((box) => ({
    url: `${SITE_URL}/products/box/${box._id}`,
    lastModified: box.updatedAt ? new Date(box.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...productEntries,
    ...categoryEntries,
    ...brandEntries,
    ...boxEntries,
  ];
}
