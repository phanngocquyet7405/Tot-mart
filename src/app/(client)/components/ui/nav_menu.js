"use client";
import { useState, useEffect, useMemo } from "react";
import DropMenu from "./drop_menu";
import {
  getAllCategoriesApi,
  getAllBrandsApi,
} from "../../../api/productServices";

export default function NavMenu() {
  const [activeDropDown, setActiveDropdown] = useState(null);

  // 1. Khởi tạo dữ liệu giả đầy đủ các nhóm để test UI
  const [categories, setCategories] = useState([
    {
      name: "Thực phẩm chức năng",
      parentGroup: "food-beverage",
      subCategories: [],
    },
    { name: "Đồ uống", parentGroup: "food-beverage", subCategories: [] },
    {
      name: "Rau củ quả hữu cơ",
      parentGroup: "food-beverage",
      subCategories: [],
    },
    {
      name: "Ngũ cốc",
      parentGroup: "food-beverage",
      subCategories: [
        { name: "Ngũ cốc", slug: "food-beverage/cereal" },
        { name: "Mỳ", slug: "food-beverage/noodle" },
        { name: "Các loại hạt", slug: "food-beverage/nuts" },
      ],
    },
    {
      name: "Sữa & Chế phẩm",
      parentGroup: "food-beverage",
      subCategories: [
        { name: "Sữa tươi", slug: "food-beverage/milk" },
        { name: "Sữa chua", slug: "food-beverage/yogurt" },
        { name: "Phô mai", slug: "food-beverage/cheese" },
      ],
    },
    {
      name: "Thực phẩm chế biến",
      parentGroup: "food-beverage",
      subCategories: [{ name: "Đồ ăn vặt", slug: "food-beverage/snack" }],
    },

    {
      name: "Trang trí nội thất",
      parentGroup: "home-living",
      subCategories: [
        { name: "Gỗ, mây, tre", slug: "home-living/wood-rattan" },
        { name: "Vật liệu tái chế", slug: "home-living/recycled-materials" },
      ],
    },
    {
      name: "Mỹ phẩm & Sức khỏe",
      parentGroup: "home-living",
      subCategories: [
        { name: "Chăm sóc cá nhân", slug: "home-living/personal-care" },
      ],
    },

    {
      name: "Thời trang nam",
      parentGroup: "fashion",
      subCategories: [{ name: "Áo thun", slug: "fashion/tshirt" }],
    },

    {
      name: "Quà tặng",
      parentGroup: "gift",
      subCategories: [{ name: "Quà doanh nghiệp", slug: "gift/corporate" }],
    },
  ]);

  const [brands, setBrands] = useState([
    { name: "Nike", slug: "nike" },
    { name: "Adidas", slug: "adidas" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getAllCategoriesApi(),
          getAllBrandsApi(),
        ]);
        const categoriesData = catRes?.data || catRes;
        const brandsData = brandRes?.data || brandRes;

        // Chỉ cập nhật nếu API có trả về dữ liệu thật
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
        if (Array.isArray(brandsData) && brandsData.length > 0) {
          setBrands(brandsData);
        }
      } catch (error) {
        console.error("Lỗi khi tải Menu (Đang dùng dữ liệu giả):", error);
      }
    };
    fetchData();
  }, []);

  const navItems = [
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
      /* SỬA TẠI ĐÂY: z-90 đổi thành z-[100] để luôn nằm trên banner */
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
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${activeDropDown === item.id ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown Menu - Đảm bảo component này có position absolute */}
      <DropMenu
        isVisible={!!activeDropDown}
        items={dynamicMenuItems[activeDropDown] || []}
        onMouseEnter={() => setActiveDropdown(activeDropDown)}
        onMouseLeave={() => setActiveDropdown(null)}
      />
    </nav>
  );
}
