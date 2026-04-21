"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DropMenu from "./drop_menu";
import { getAllCategoriesApi } from "../../../services/api/productServices";

export default function NavMenu() {
  const [activeDropDown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllCategoriesApi();
        // Lấy mảng data từ response của bạn
        setCategories(res?.data?.data || res?.data || []);
      } catch (error) {
        console.error("Lỗi tải menu:", error);
      }
    };
    fetchData();
  }, []);

  const menuData = useMemo(() => {
    if (!categories.length) return { roots: [], tree: {} };

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

    const tree = {};
    rootCategories.forEach((root) => {
      tree[root._id] = (root.childrenIds || [])
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

    return { roots: rootCategories, tree };
  }, [categories]);

  return (
    <nav
      className="w-full bg-white border-b relative z-50"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="max-w-7xl mx-auto flex justify-center space-x-6">
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
      </div>

      {/* DropMenu hiển thị danh mục con và cháu */}
      <DropMenu
        isVisible={!!activeDropDown}
        items={menuData.tree[activeDropDown] || []}
        onMouseEnter={() => setActiveDropdown(activeDropDown)}
        onMouseLeave={() => setActiveDropdown(null)}
      />
    </nav>
  );
}
