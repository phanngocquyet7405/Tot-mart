"use client";

import { useState } from "react";
import { X } from "lucide-react";
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

const categories = ["Electronics", "Accessories", "Gaming", "Storage", "Audio"];
const brands = [
  "AudioMax",
  "TechWear",
  "DeskPro",
  "ConnectX",
  "GameZone",
  "VisionTech",
  "ClickMaster",
  "DataVault",
];
const statuses = ["In Stock", "Low Stock", "Out of Stock"];

export function AdvancedFilterDrawer({ open, onOpenChange, onApplyFilters }) {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleApply = () => {
    onApplyFilters?.({
      priceRange,
      status: selectedStatuses,
      category,
      brand,
      dateFrom,
      dateTo,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setPriceRange([0, 500]);
    setSelectedStatuses([]);
    setCategory("");
    setBrand("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Filter products by multiple criteria
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Price Range */}
          <div className="space-y-4">
            <Label>Price Range</Label>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value)}
              max={500}
              min={0}
              step={10}
              className="mt-2"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="filter-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="filter-brand">Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger id="filter-brand">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Creation Date</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="date-from"
                  className="text-xs text-muted-foreground"
                >
                  From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="date-to"
                  className="text-xs text-muted-foreground"
                >
                  To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
