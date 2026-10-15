"use client";
export default function ProductForm({ field, select, editing, options }) { return <>{field('price', 'Giá (VND)', 'number')}{!editing && field('stock', 'Tồn kho', 'number')}{select('brand', 'Thương hiệu', options.brands)}{select('category', 'Danh mục', options.categories)}{!options.brands.length && <p>Admin cần tạo thương hiệu và gán cho tài khoản merchant trước.</p>}</>; }
