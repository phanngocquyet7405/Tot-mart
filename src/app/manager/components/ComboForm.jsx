"use client";
export default function ComboForm({ field, editing, productPicker }) { return <>{productPicker}{!editing && field('stock', 'Tồn kho combo', 'number')}{field('validTo', 'Ngày kết thúc bán', 'date')}{field('discountPercent', 'Giảm giá combo (%)', 'number')}</>; }
