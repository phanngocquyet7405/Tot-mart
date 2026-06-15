"use client";

import { useState } from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

// Dữ liệu mặc định nếu props không truyền xuống
const DEFAULT_STATUSES = ["In Stock", "Low Stock", "Out of Stock"];

export function AdvancedFilterDrawer({
  open,
  onOpenChange,
  onApplyFilters,
  categories = [], // Nhận từ API hoặc cha
  brands = [], // Nhận từ API hoặc cha
}) {
  // --- States ---
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --- Handlers ---
  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleApply = () => {
    onApplyFilters?.({
      category: category === "all" ? null : category,
      brand: brand === "all" ? null : brand,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      status: selectedStatuses.length > 0 ? selectedStatuses : null,
      dateRange: { from: dateFrom, to: dateTo },
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setPriceRange([0, 1000]);
    setSelectedStatuses([]);
    setCategory("all");
    setBrand("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <SheetTitle>Bộ lọc nâng cao</SheetTitle>
          </div>
          <SheetDescription>
            Tìm kiếm sản phẩm chính xác theo nhiều tiêu chí.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8 pb-20">
          {/* 1. Category - Linh hoạt theo ID/Name từ API */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Danh mục sản phẩm</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id || cat} value={String(cat.id || cat)}>
                    {cat.name || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Brand */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Thương hiệu</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả thương hiệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id || b} value={String(b.id || b)}>
                    {b.name || b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Price Range - Slider từ bản 2 & 3 */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Khoảng giá</Label>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={2000}
              min={0}
              step={50}
              className="py-4"
            />
          </div>

          {/* 4. Status - Checkbox từ bản 1 & 3 */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Trạng thái kho</Label>
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-xs cursor-pointer flex-1"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Date Range - Input từ bản 1 & 3 */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Thời gian nhập hàng</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase text-muted-foreground font-bold">
                  Từ ngày
                </p>
                <Input
                  type="date"
                  className="text-xs"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase text-muted-foreground font-bold">
                  Đến ngày
                </p>
                <Input
                  type="date"
                  className="text-xs"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Cố định ở cuối Sheet */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Áp dụng lọc
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
