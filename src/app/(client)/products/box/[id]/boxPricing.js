// Giá hộp quà.
// BE lưu `box.value` là GIÁ BÁN đã trừ discountPercent
// (value = tổng giá thành phần × (1 − discountPercent/100)) và tính tiền
// checkout bằng Math.round(box.value). FE KHÔNG được trừ discountPercent
// thêm lần nữa, nếu không giá hiển thị sẽ thấp hơn giá thật khách bị tính.

export function boxSalePrice(box) {
  const value = Number(box?.value);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

// Giá gốc trước giảm (chỉ để gạch ngang). BE không lưu giá gốc nên suy ra
// từ giá bán và phần trăm giảm; trả null khi hộp không giảm giá.
export function boxOriginalPrice(box) {
  const percent = Number(box?.discountPercent);
  const value = Number(box?.value);
  if (!(percent > 0 && percent < 100)) return null;
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value / (1 - percent / 100));
}

// Dòng giỏ hàng cho hộp. `itemType: "box"` bắt buộc: giỏ hàng mặc định coi là
// sản phẩm và checkout sẽ gửi id hộp dưới dạng productId (bị bỏ khi đồng bộ).
export function toBoxCartItem(box, fallbackImage) {
  return {
    _id: box._id,
    itemType: "box",
    name: box.name,
    image: box.images?.[0]?.url || fallbackImage,
    price: boxSalePrice(box),
  };
}
