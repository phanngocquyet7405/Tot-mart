"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DropMenu from "./drop_menu";
import CategoryDropdown from "./category_dropdown";
import {
  getAllCategoriesApi,
  getAllBrandsApi,
  getAllProductsApi,
} from "../../../services/api/productServices";

export default function NavMenu() {
  const [activeDropDown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, prodRes] = await Promise.all([
          getAllCategoriesApi(),
          getAllBrandsApi(),
          getAllProductsApi(),
        ]);

        setCategories(catRes?.data?.data || catRes?.data || []);
        setBrands(brandRes?.data?.data || brandRes?.data || []);
        setProducts(prodRes?.data?.data || prodRes?.data || []);
      } catch (error) {
        console.error("Lỗi tải menu:", error);
      }
    };
    fetchData();
  }, []);

  const menuData = useMemo(() => {
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
          const targetId = typeof child === "string" ? child : child?.categoryId;
          const childDoc = activeCats.find(
            (c) => c._id.toString() === targetId?.toString(),
          );
          if (!childDoc) return null;
          return {
            title: childDoc.name,
            titleHref: `/categories/${childDoc.slug || childDoc._id}`,
            links: (childDoc.childrenIds || [])
              .map((gChild) => {
                const gTargetId = typeof gChild === "string" ? gChild : gChild?.categoryId;
                const gChildDoc = activeCats.find(
                  (c) => c._id.toString() === gTargetId?.toString(),
                );
                return gChildDoc
                  ? { label: gChildDoc.name, href: `/categories/${gChildDoc.slug || gChildDoc._id}` }
                  : null;
              })
              .filter(Boolean),
          };
        })
        .filter(Boolean);
    });

    const activeBrands = brands.filter((b) => b.isActive !== false);
    const brandLinks = activeBrands.map((b) => ({
      label: b.name,
      href: `/brands/${b.slug || b._id}`,
    }));
    const brandColumns = [];
    for (let i = 0; i < brandLinks.length; i += 8) {
      brandColumns.push({
        title: i === 0 ? "Thương hiệu nổi bật" : "Thương hiệu khác",
        titleHref: "/brands",
        links: brandLinks.slice(i, i + 8),
      });
    }

    const activeProducts = products.filter((p) => p.isActive !== false);
    const productLinks = activeProducts.map((p) => ({
      label: p.name,
      href: `/products/${p.slug || p._id}`,
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

    return { roots: rootCategories, categoryTree, brandColumns, productColumns };
  }, [categories, brands, products]);

  const activeRoot = menuData.roots.find((r) => r._id === activeDropDown) || null;

  return (
    <nav
      className="relative z-50 w-full border-b bg-white"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="mx-auto flex max-w-7xl justify-center space-x-8">
        {menuData.roots.map((root) => (
          <div
            key={root._id}
            className="relative cursor-pointer py-5"
            onMouseEnter={() => setActiveDropdown(root._id)}
          >
            <Link
              href={`/categories/${root.slug || root._id}`}
              className={`text-[12px] font-bold uppercase transition-colors ${
                activeDropDown === root._id ? "text-[#C85C3C]" : "text-zinc-600"
              } hover:text-[#C85C3C]`}
            >
              {root.name}
            </Link>
          </div>
        ))}

        <div className="relative cursor-pointer py-5" onMouseEnter={() => setActiveDropdown("products")}>
          <Link
            href="/products"
            className={`text-[12px] font-bold uppercase transition-colors ${
              activeDropDown === "products" ? "text-[#C85C3C]" : "text-zinc-600"
            } hover:text-[#C85C3C]`}
          >
            Sản phẩm
          </Link>
        </div>

        <div className="relative cursor-pointer py-5" onMouseEnter={() => setActiveDropdown("brands")}>
          <Link
            href="/brands"
            className={`text-[12px] font-bold uppercase transition-colors ${
              activeDropDown === "brands" ? "text-[#C85C3C]" : "text-zinc-600"
            } hover:text-[#C85C3C]`}
          >
            Thương hiệu
          </Link>
        </div>
      </div>

      {activeRoot ? (
        <CategoryDropdown
          root={activeRoot}
          columns={menuData.categoryTree[activeRoot._id] || []}
          onMouseEnter={() => setActiveDropdown(activeDropDown)}
          onMouseLeave={() => setActiveDropdown(null)}
        />
      ) : (
        <DropMenu
          isVisible={activeDropDown === "brands" || activeDropDown === "products"}
          items={activeDropDown === "brands" ? menuData.brandColumns : menuData.productColumns}
          onMouseEnter={() => setActiveDropdown(activeDropDown)}
          onMouseLeave={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
}
