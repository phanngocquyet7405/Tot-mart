"use client";

import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductList({
  products = [],
  availableProducts = [],
  errors = {},
  onChangeProduct,
  onAddProduct,
  onRemoveProduct,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductRowIndex, setSelectedProductRowIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatVND = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const filteredProducts = availableProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openProductDialog = (index) => {
    setSelectedProductRowIndex(index);
    setSearchTerm("");
    setIsDialogOpen(true);
  };

  const handleSelectProduct = (p) => {
    if (
      selectedProductRowIndex !== null &&
      typeof onChangeProduct === "function"
    ) {
      // Cập nhật cả 3 trường productId, name, price cùng lúc bằng object
      onChangeProduct(selectedProductRowIndex, {
        productId: p._id,
        name: p.name,
        price: p.price || 0,
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {/* Header table */}
        <div className="grid grid-cols-12 gap-4 bg-gray-50/80 dark:bg-gray-800/60 px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 select-none">
          <div className="col-span-6">Tên sản phẩm *</div>
          <div className="col-span-2">Số lượng</div>
          <div className="col-span-3">Giá (đ)</div>
          <div className="col-span-1 text-center">Xóa</div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {products.map((product, index) => {
            const itemKey = product.id || product._id || `product-row-${index}`;

            return (
              <div
                key={itemKey}
                className="grid grid-cols-12 gap-4 px-5 py-4 items-start bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50/30"
              >
                {/* ── Cột Tên sản phẩm ── */}
                <div className="col-span-6 space-y-1.5">
                  <div
                    onClick={() => openProductDialog(index)}
                    className="flex items-center justify-between border border-gray-200 dark:border-gray-800 px-3.5 h-10 text-sm rounded-md bg-white dark:bg-gray-900 cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition shadow-sm select-none"
                  >
                    <span className="truncate max-w-[85%] text-gray-700 dark:text-gray-200 font-medium">
                      {product.name
                        ? product.name
                        : "Chọn sản phẩm từ danh sách..."}
                    </span>
                  </div>

                  {errors[`product_${index}_productId`] && (
                    <span className="text-xs text-red-500 block">
                      {errors[`product_${index}_productId`]}
                    </span>
                  )}
                </div>

                {/* ── Cột Số lượng ── */}
                <div className="col-span-2 space-y-1.5">
                  <Input
                    type="number"
                    min={1}
                    value={product.quantity || 1}
                    onChange={(e) =>
                      onChangeProduct(
                        index,
                        "quantity",
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    className="h-10 text-sm px-3 py-1.5 focus-visible:ring-1 focus-visible:ring-blue-500 bg-white dark:bg-gray-900"
                  />
                  {errors[`product_${index}_quantity`] && (
                    <span className="text-xs text-red-500 block">
                      {errors[`product_${index}_quantity`]}
                    </span>
                  )}
                </div>

                {/* ── Cột Đơn giá ── */}
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={0}
                    value={product.price || 0}
                    onChange={(e) =>
                      onChangeProduct(
                        index,
                        "price",
                        Math.max(0, parseInt(e.target.value) || 0),
                      )
                    }
                    className="h-10 text-sm px-3 py-1.5 focus-visible:ring-1 focus-visible:ring-blue-500 bg-white dark:bg-gray-900"
                  />
                </div>

                {/* ── Cột Nút xóa ── */}
                <div className="col-span-1 flex justify-center pt-2">
                  <button
                    type="button"
                    disabled={products.length <= 1}
                    onClick={() => onRemoveProduct(index)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onAddProduct}
        className="w-full flex items-center justify-center gap-2 border-dashed border-gray-300 dark:border-gray-700 h-11 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
      >
        <Plus size={16} />
        Thêm sản phẩm mới vào box
      </Button>

      {/* ── Dialog Form Dialog chọn sản phẩm ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader className="p-5 border-b border-gray-100 dark:border-gray-800">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Chọn sản phẩm
            </DialogTitle>
          </DialogHeader>

          {/* Ô Tìm kiếm */}
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 select-none pointer-events-none" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên..."
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9.5 text-sm bg-white dark:bg-gray-900 focus-visible:ring-1 focus-visible:ring-blue-500 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Danh sách các sản phẩm */}
          <div className="flex-1 overflow-y-auto p-4 min-h-75 max-h-112.5">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Không tìm thấy sản phẩm nào
                </p>
                {searchTerm && (
                  <p className="text-xs text-gray-400 mt-1">
                    Thử tìm kiếm với từ khóa khác.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredProducts.map((p) => {
                  let mainImage = null;
                  if (Array.isArray(p.images) && p.images[0]) {
                    const firstImg = p.images[0];
                    if (typeof firstImg === "string") {
                      mainImage = firstImg;
                    } else if (
                      firstImg &&
                      typeof firstImg === "object" &&
                      firstImg.url
                    ) {
                      mainImage = firstImg.url;
                    } else if (
                      firstImg instanceof Blob ||
                      firstImg instanceof File
                    ) {
                      mainImage = URL.createObjectURL(firstImg);
                    }
                  }

                  return (
                    <div
                      key={p._id}
                      onClick={() => handleSelectProduct(p)}
                      className="p-3.5 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 cursor-pointer flex items-center justify-between gap-4 transition shadow-sm"
                    >
                      {/* Trái: Ảnh và Tên */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Thumbnail */}
                        <div className="relative w-12 h-12 rounded-lg border border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden shrink-0">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={p.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100/60 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 font-medium select-none">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-600 transition duration-150">
                            {p.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate leading-normal">
                            ID:{" "}
                            <span className="font-mono text-[11px] text-gray-400">
                              {p._id}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Phải: Giá */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatVND(p.price || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
