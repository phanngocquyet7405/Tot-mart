export const optionId = value => typeof value === 'object' && value !== null ? value._id || '' : value || '';

export function productDraft(product) {
  return {
    name: product?.name || '', description: product?.description || product?.descriptions || '',
    price: product?.price ?? '', stock: product?.stock ?? 0,
    brand: optionId(product?.brand), category: optionId(product?.category), products: [],
  };
}

export function validateProduct(form, options, editing) {
  const errors = {};
  if (form.name.trim().length < 3 || form.name.trim().length > 100) errors.name = 'Tên sản phẩm phải từ 3 đến 100 ký tự.';
  if (!form.description.trim() || form.description.trim().length > 500) errors.description = 'Mô tả phải có nội dung và tối đa 500 ký tự.';
  if (form.price === '' || !Number.isSafeInteger(Number(form.price)) || Number(form.price) <= 0) errors.price = 'Giá phải là số nguyên lớn hơn 0.';
  if (!editing && (form.stock === '' || !Number.isSafeInteger(Number(form.stock)) || Number(form.stock) < 0)) errors.stock = 'Tồn kho phải là số nguyên không âm.';
  for (const [key, label] of [['brand', 'thương hiệu'], ['category', 'danh mục']]) {
    if (!options[key === 'brand' ? 'brands' : 'categories'].some(item => item._id === form[key])) errors[key] = `Vui lòng chọn ${label} được phép từ danh sách.`;
  }
  return errors;
}

export function validateProductImages(files) {
  if (files.length > 10) return 'Mỗi lần lưu chỉ được thêm tối đa 10 ảnh.';
  if (files.some(file => !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name))) return 'Ảnh phải có định dạng và phần mở rộng JPEG, JPG, PNG hoặc WebP.';
  if (files.some(file => file.size > 2 * 1024 * 1024)) return 'Mỗi ảnh không được vượt quá 2 MB.';
  return '';
}

export function validStockAdjustment(delta, stock, reason) {
  return delta !== '' && Number.isSafeInteger(Number(delta)) && Number(delta) !== 0 && Math.abs(Number(delta)) <= 1000000 && stock != null && stock !== '' && Number.isSafeInteger(Number(stock)) && Number(stock) + Number(delta) >= 0 && reason.trim().length <= 200;
}

export function managerError(error, fallback = 'Không thể tải dữ liệu. Vui lòng thử lại.') {
  return error.response?.data?.errors?.map(item => item.message).filter(Boolean).join('; ') || error.response?.data?.message || (error.isAxiosError ? fallback : error.message) || fallback;
}

export const money = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? 'Chưa có giá' : `${Number(value).toLocaleString('vi-VN')} ₫`;
