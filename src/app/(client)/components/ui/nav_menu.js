"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DropMenu from "./drop_menu";
import {
  getAllCategoriesApi,
  getAllBrandsApi,
  getAllProductsApi, // 1. Giả sử bạn có hàm này trong services
} from "../../../services/api/productServices";

export default function NavMenu() {
  const [activeDropDown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]); // 2. Thêm state sản phẩm

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi đồng thời cả 3 API
        const [catRes, brandRes, prodRes] = await Promise.all([
          getAllCategoriesApi(),
          getAllBrandsApi(),
          getAllProductsApi(),
        ]);

        setCategories(catRes?.data?.data || catRes?.data || []);
        setBrands(brandRes?.data?.data || brandRes?.data || []);
        setProducts(prodRes?.data?.data || prodRes?.data || []); // Cập nhật state
      } catch (error) {
        console.error("Lỗi tải menu:", error);
      }
    };
    fetchData();
  }, []);

  const menuData = useMemo(() => {
    // --- Xử lý Categories (Giữ nguyên logic của bạn) ---
    const activeCats = categories.filter((cat) => cat.isActive !== false);
    const allChildIds = new Set();
    activeCats.forEach((cat) => {
      (cat.childrenIds || []).forEach((child) => {
        const id = typeof child === "string" ? child : child?.categoryId;
        if (id) allChildIds.add(id.toString());
      });
    });
    const rootCategories = activeCats.filter(
      (cat) => !allChildIds.has(cat._id.toString()),
    );
    const categoryTree = {};
    rootCategories.forEach((root) => {
      categoryTree[root._id] = (root.childrenIds || [])
        .map((child) => {
          const targetId =
            typeof child === "string" ? child : child?.categoryId;
          const childDoc = activeCats.find(
            (c) => c._id.toString() === targetId?.toString(),
          );
          if (!childDoc) return null;
          return {
            title: childDoc.name,
            titleHref: `/category/${childDoc.slug || childDoc._id}`,
            links: (childDoc.childrenIds || [])
              .map((gChild) => {
                const gTargetId =
                  typeof gChild === "string" ? gChild : gChild?.categoryId;
                const gChildDoc = activeCats.find(
                  (c) => c._id.toString() === gTargetId?.toString(),
                );
                return gChildDoc
                  ? {
                      label: gChildDoc.name,
                      href: `/category/${gChildDoc.slug || gChildDoc._id}`,
                    }
                  : null;
              })
              .filter(Boolean),
          };
        })
        .filter(Boolean);
    });

    // --- Xử lý Brands (Giữ nguyên) ---
    const activeBrands = brands.filter((b) => b.isActive !== false);
    const brandLinks = activeBrands.map((b) => ({
      label: b.name,
      href: `/brand/${b.slug || b._id}`,
    }));
    const brandColumns = [];
    for (let i = 0; i < brandLinks.length; i += 8) {
      brandColumns.push({
        title: i === 0 ? "Thương hiệu nổi bật" : "Thương hiệu khác",
        titleHref: "/brands",
        links: brandLinks.slice(i, i + 8),
      });
    }

    // --- 3. Xử lý Products (Copy logic từ Brand) ---
    const activeProducts = products.filter((p) => p.isActive !== false);
    const productLinks = activeProducts.map((p) => ({
      label: p.name,
      href: `/product/${p.slug || p._id}`, // Link tới chi tiết sản phẩm
    }));

    const productColumns = [];
    const productsPerColumn = 8;
    for (let i = 0; i < productLinks.length; i += productsPerColumn) {
      productColumns.push({
        title: i === 0 ? "Sản phẩm mới" : "Sản phẩm khác",
        titleHref: "/products",
        links: productLinks.slice(i, i + productsPerColumn),
      });
    }

    return {
      roots: rootCategories,
      categoryTree,
      brandColumns,
      productColumns,
    };
  }, [categories, brands, products]);

  return (
    <nav
      className="w-full bg-white border-b relative z-50"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="max-w-7xl mx-auto flex justify-center space-x-8">
        {/* Danh mục root */}
        {menuData.roots.map((root) => (
          <div
            key={root._id}
            className="relative py-5 cursor-pointer group"
            onMouseEnter={() => setActiveDropdown(root._id)}
          >
            <Link
              href={`/category/${root.slug || root._id}`}
              className={`font-bold uppercase text-[12px] transition-colors ${
                activeDropDown === root._id
                  ? "text-orange-600"
                  : "text-zinc-600"
              } hover:text-orange-600`}
            >
              {root.name}
            </Link>
          </div>
        ))}

        {/* 4. Thêm mục Sản phẩm */}
        <div
          className="relative py-5 cursor-pointer group"
          onMouseEnter={() => setActiveDropdown("products")}
        >
          <Link
            href="/products"
            className={`font-bold uppercase text-[12px] transition-colors ${
              activeDropDown === "products"
                ? "text-orange-600"
                : "text-zinc-600"
            } hover:text-orange-600`}
          >
            Sản phẩm
          </Link>
        </div>

        {/* Thương hiệu */}
        <div
          className="relative py-5 cursor-pointer group"
          onMouseEnter={() => setActiveDropdown("brands")}
        >
          <Link
            href="/brands"
            className={`font-bold uppercase text-[12px] transition-colors ${
              activeDropDown === "brands" ? "text-orange-600" : "text-zinc-600"
            } hover:text-orange-600`}
          >
            Thương hiệu
          </Link>
        </div>
      </div>

      {/* Dropdown Menu chung */}
      <DropMenu
        isVisible={!!activeDropDown}
        items={
          activeDropDown === "brands"
            ? menuData.brandColumns
            : activeDropDown === "products"
              ? menuData.productColumns
              : menuData.categoryTree[activeDropDown] || []
        }
        onMouseEnter={() => setActiveDropdown(activeDropDown)}
        onMouseLeave={() => setActiveDropdown(null)}
      />
    </nav>
  );
}
