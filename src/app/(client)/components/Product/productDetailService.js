import {
  getProductByIdApi,
  getProductsByCategoryApi,
} from "@/app/services/api/productServices";

// Ảnh dự phòng dùng chung — đồng bộ với pattern đang dùng ở trang box detail
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2' ry='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg>";

/**
 * Tách productId thật từ slug URL dạng "{slug}-{id}" — quy ước đang dùng
 * xuyên suốt app (xem product_card.js: `/products/${slug}-${productId}`).
 * Nếu slug không chứa dấu "-", coi cả chuỗi là id (fallback an toàn).
 */
export function extractProductId(slug = "") {
  return slug.includes("-") ? slug.split("-").pop() : slug;
}

/**
 * Lấy chi tiết 1 sản phẩm theo id.
 * Tự xử lý 2 khả năng bọc data (axios interceptor có thể unwrap 1-2 lớp).
 */
export async function fetchProductDetail(productId) {
  const res = await getProductByIdApi(productId);
  return res?.data?.data || res?.data || null;
}

/**
 * Lấy sản phẩm liên quan theo category, loại bỏ sản phẩm hiện tại,
 * giới hạn tối đa `limit` sản phẩm.
 */
export async function fetchRelatedProducts(categoryId, excludeId, limit = 8) {
  if (!categoryId) return [];
  const res = await getProductsByCategoryApi(categoryId);
  const data = res?.data?.data || res?.data || [];
  const list = Array.isArray(data) ? data : [];
  return list.filter((p) => p._id !== excludeId).slice(0, limit);
}

/** Định dạng tiền VNĐ. */
export function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
}

/**
 * Tính giá sau giảm giá.
 * Lưu ý: field `discount` (%) hiện KHÔNG có trong form tạo/sửa sản phẩm ở
 * admin — nên với dữ liệu thật hiện tại hàm này gần như luôn trả về price
 * gốc. Khi backend/admin bổ sung field discount, phần UI sẽ tự động hiển
 * thị đúng mà không cần sửa gì thêm ở đây.
 */
export function getFinalPrice(product) {
  if (!product) return 0;
  const discount = product.discount || 0;
  if (discount > 0) {
    return product.price - (product.price * discount) / 100;
  }
  return product.price;
}

/** Build href tới trang chi tiết sản phẩm, đúng quy ước "{slug}-{id}" toàn app. */
export function buildProductHref(product) {
  if (!product) return "/products";
  const slugPart = product.slug || "san-pham";
  return `/products/${slugPart}-${product._id}`;
}
