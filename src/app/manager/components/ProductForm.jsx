"use client";

export default function ProductForm({ field, select, editing, options }) {
  return (
    <>
      {field('price', 'Giá bán (VND)', 'number')}
      {!editing && field('stock', 'Tồn kho', 'number')}
      {select('category', 'Danh mục', options.categories)}
      {select('brand', 'Thương hiệu', options.brands)}
      {!options.brands?.length && (
        <p className="text-sm font-medium text-destructive-text sm:col-span-2">
          Admin cần tạo thương hiệu và gán cho tài khoản merchant trước.
        </p>
      )}
    </>
  );
}
