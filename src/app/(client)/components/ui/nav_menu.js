"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link"; // Import Link để chuyển trang
import DropMenu from "./drop_menu";
import {
  getAllCategoriesApi,
  getAllBrandsApi,
} from "../../../services/api/productServices";

export default function NavMenu() {
  const [activeDropDown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getAllCategoriesApi(),
          getAllBrandsApi(),
        ]);
        const categoriesData = catRes?.data || catRes;
        const brandsData = brandRes?.data || brandRes;

        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (Array.isArray(brandsData)) setBrands(brandsData);
      } catch (error) {
        console.error("Lỗi khi tải Menu:", error);
      }
    };
    fetchData();
  }, []);

  const navItems = [
    {
      id: "products",
      label: "Sản Phẩm",
      hasDropdown: false,
      href: "/products",
    },
    { id: "food-beverage", label: "Thực Phẩm & Đồ Uống", hasDropdown: true },
    { id: "home-living", label: "Gia Đình", hasDropdown: true },
    { id: "fashion", label: "Thời Trang", hasDropdown: true },
    { id: "brand", label: "Thương Hiệu", hasDropdown: true },
    { id: "gift", label: "Quà Tặng", hasDropdown: true },
    {
      id: "collection",
      label: "Bộ Sưu Tập",
      hasDropdown: false,
      href: "#collections",
    },
  ];

  const dynamicMenuItems = useMemo(() => {
    const mapByGroup = (groupName) => {
      if (!Array.isArray(categories)) return [];
      return categories
        .filter((cat) => cat?.parentGroup === groupName)
        .map((cat) => ({
          title: cat.name,
          titleHref: `/category/${cat.slug || cat._id}`,
          links:
            cat.subCategories?.map((sub) => ({
              label: sub.name,
              href: `/category/${sub.slug}`,
            })) || [],
        }));
    };

    return {
      brand: [
        {
          title: "Tất cả thương hiệu",
          titleHref: "/brands",
          links: brands.map((b) => ({
            label: b.name,
            href: `/brands/${b.slug || b._id}`,
          })),
        },
      ],
      "food-beverage": mapByGroup("food-beverage"),
      "home-living": mapByGroup("home-living"),
      fashion: mapByGroup("fashion"),
      gift: mapByGroup("gift"),
    };
  }, [categories, brands]);

  return (
    <nav
      className="w-full bg-white border-b border-gray-100 relative z-100"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="hidden lg:flex items-center justify-center space-x-10">
          {navItems.map((item) => (
            <div
              key={item.id}
              className="relative py-5 group cursor-pointer"
              onMouseEnter={() =>
                item.hasDropdown && setActiveDropdown(item.id)
              }
            >
              <Link
                href={item.href || "#"}
                className="flex items-center gap-1.5 no-underline"
              >
                <button
                  className={`text-[13px] uppercase tracking-widest font-medium transition-all duration-300 flex items-center gap-1.5
                  ${activeDropDown === item.id ? "text-orange-500" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <svg
                      className={`w-3 h-3 transition-transform duration-300 ${activeDropDown === item.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
              </Link>
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${activeDropDown === item.id ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
        </div>
      </div>

      <DropMenu
        isVisible={!!activeDropDown}
        items={dynamicMenuItems[activeDropDown] || []}
        onMouseEnter={() => setActiveDropdown(activeDropDown)}
        onMouseLeave={() => setActiveDropdown(null)}
      />
    </nav>
  );
}
