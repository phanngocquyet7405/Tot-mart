"use client";
import logger from "@/app/util/Logger";
import { ChevronDown, X, ChevronUp, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  getAllBrandsApi,
  getAllCategoriesApi,
} from "@/app/services/api/productServices";

export default function SideBar({ isOpen: controlledOpen, onClose: controlledClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const onClose = isControlled ? controlledClose : () => setInternalOpen(false);

  const [openSections, setOpenSections] = useState(['categories', 'brands', 'flavor', 'dietary']);

  const toggleSection = (section) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s != section)
        : [...prev, section]
    );
  };

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([getAllCategoriesApi(), getAllBrandsApi()])
      .then(([categoryResponse, brandResponse]) => {
        const unwrap = (response) => response?.data?.data || response?.data || response || [];
        if (active) {
          setCategories(Array.isArray(unwrap(categoryResponse)) ? unwrap(categoryResponse) : []);
          setBrands(Array.isArray(unwrap(brandResponse)) ? unwrap(brandResponse) : []);
        }
      })
      .catch((error) => logger.error("Error loading sidebar data:", error));
    return () => { active = false; };
  }, []);

  const { rootCategories, flavorOptions, dietaryOptions } = useMemo(() => {
    const idOf = (value) => typeof value === "string" ? value : value?._id;
    const roots = categories.filter((category) => !idOf(category.parentId || category.parent || category.parentCategory));
    const childrenOf = (root) => categories.filter((category) => idOf(category.parentId || category.parent || category.parentCategory) === root._id);
    const findRoot = (names) => roots.find((root) => names.includes(String(root.name || root.title || "").toLowerCase()));
    const optionsFor = (root) => root ? childrenOf(root).map((child) => ({
      label: child.name || child.title,
      count: child.productCount ?? child.productsCount ?? child.count ?? 0,
    })) : [];
    return {
      rootCategories: roots,
      flavorOptions: optionsFor(findRoot(["flavor", "flavors", "hương vị"])),
      dietaryOptions: optionsFor(findRoot(["dietary", "diet", "chế độ ăn"])),
    };
  }, [categories]);

  const displayName = (item) => item?.name || item?.title || item?.brandName || item?.label || "Unnamed";

  return (
    <>
      {/* Mobile Drawer Trigger (when not controlled by external button) */}
      {!isControlled && (
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setInternalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors min-h-11 shadow-xs"
            aria-label="Mở bộ lọc tìm kiếm"
          >
            <SlidersHorizontal size={16} />
            <span>Bộ lọc danh mục ({rootCategories.length + brands.length})</span>
          </button>
        </div>
      )}

      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-72 lg:w-64 bg-card border-r border-border
          transition-transform duration-200 z-50
          overflow-y-auto
          ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Bộ lọc</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center"
            aria-label="Đóng bộ lọc"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Categories Section */}
          <div className="border-b border-border pb-4">
            <button onClick={() => toggleSection('categories')} className="flex items-center justify-between w-full mb-3 pointer-coarse:min-h-11">
              <h3 className="font-semibold text-foreground text-sm">Danh mục</h3>
              {openSections.includes('categories') ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSections.includes('categories') && (
              <div className="flex flex-col gap-2">
                {rootCategories.map((category) => (
                  <a
                    key={category._id}
                    href={`/categories/${category._id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors py-1 block"
                  >
                    {displayName(category)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Brands Section */}
          <div className="border-b border-border pb-4">
            <button onClick={() => toggleSection('brands')} className="flex items-center justify-between w-full mb-3 pointer-coarse:min-h-11">
              <h3 className="font-semibold text-foreground text-sm">Thương hiệu</h3>
              {openSections.includes('brands') ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSections.includes('brands') && (
              <div className="flex flex-col gap-2">
                {brands.map((brand) => (
                  <a
                    key={brand._id}
                    href={`/products?brand=${brand._id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors py-1 block"
                  >
                    {displayName(brand)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Flavor Section */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('flavor')}
              className="flex items-center justify-between w-full mb-3 pointer-coarse:min-h-11"
            >
              <h3 className="font-semibold text-foreground text-sm">Hương vị</h3>
              {openSections.includes('flavor') ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {openSections.includes('flavor') && (
              <div className="space-y-2.5">
                {flavorOptions.map((option) => (
                  <label key={option.label} className="flex items-center gap-2 cursor-pointer group py-0.5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                    />
                    <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                      ({option.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Dietary Section */}
          <div className="border-b border-border pb-4">
            <button
              onClick={() => toggleSection('dietary')}
              className="flex items-center justify-between w-full mb-3 pointer-coarse:min-h-11"
            >
              <h3 className="font-semibold text-foreground text-sm">Chế độ ăn</h3>
              {openSections.includes('dietary') ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {openSections.includes('dietary') && (
              <div className="space-y-2.5">
                {dietaryOptions.map((option) => (
                  <label key={option.label} className="flex items-center gap-2 cursor-pointer group py-0.5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                    />
                    <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                      ({option.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 border border-border bg-card rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors min-h-11"
          >
            Đóng bộ lọc
          </button>
        </div>
      </aside>
    </>
  );
}
