// cartItem.js
// Chuẩn hoá item trong giỏ hàng. Nhiều nơi gọi addToCart(product) với object
// sản phẩm thô từ API (có `images: [{url}]`, không có `image`, `price` là giá
// gốc), số khác truyền sẵn { image, price } — helper này gom cả hai về một
// hình dạng duy nhất để checkout luôn tìm được ảnh và giá.

export const CART_PLACEHOLDER_IMAGE = "/assets/placeholder.png";

/** Lấy URL ảnh từ item, chịu được cả `image` lẫn `images[0]` (string hoặc {url}). */
export function getCartItemImage(item) {
  if (!item) return null;
  if (typeof item.image === "string" && item.image) return item.image;
  const first = Array.isArray(item.images) ? item.images[0] : null;
  if (typeof first === "string") return first || null;
  return first?.url || null;
}

/**
 * Chuẩn hoá 1 sản phẩm/item về dạng lưu trong giỏ. Idempotent — gọi lại trên
 * item đã chuẩn hoá không đổi gì (dùng luôn để "chữa" dữ liệu cũ trong
 * localStorage).
 *
 * - `image`: luôn là 1 string URL (hoặc undefined), bỏ mảng `images` và
 *   `description` để không nhét dữ liệu nặng vào localStorage.
 * - `price`: với sản phẩm thô có `salePercent` thì trừ giảm giá — cùng công
 *   thức BE dùng khi tính đơn (buildOrderProductsFromCart).
 */
export function normalizeCartProduct(product) {
  if (!product || typeof product !== "object") return product;

  const { images, description, ...rest } = product; // eslint-disable-line no-unused-vars
  const image = getCartItemImage(product) || undefined;

  const isRaw = !product.image && Array.isArray(images);
  const salePercent = Number(product.salePercent) || 0;
  const price =
    isRaw && salePercent > 0
      ? Math.round(product.price * (1 - salePercent / 100))
      : product.price;

  return { ...rest, image, price };
}
