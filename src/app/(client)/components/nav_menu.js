'use client';
import { useState } from "react";
import DropMenu from "./drop_menu";

const menuItems = {
  'food-beverage': [
    { title: 'Thực phẩm chức năng', links: [] },
    { title: 'Đồ uống', links: [] },
    { title: 'Rau củ quả hữu cơ', links: [] },
    { title: 'Ngũ cốc', links: [
      { label: 'Ngũ cốc', href: '/food-beverage/cereal' },
      { label: 'Mỳ', href: '/food-beverage/noodle' },
      { label: 'Các loại hạt', href: '/food-beverage/nuts' }
    ]},
    { title: 'Sữa & Chế phẩm', links: [
      { label: 'Sữa tươi', href: '/food-beverage/milk' },
      { label: 'Sữa chua', href: '/food-beverage/yogurt' },
      { label: 'Phô mai', href: '/food-beverage/cheese' },
    ]},
    { title: 'Thực phẩm chế biến', links: [{ label: 'Đồ ăn vặt', href: '/food-beverage/snack' }] },
  ],
  'home-living': [
    { title: 'Trang trí nội thất', links: [
      { label: 'Gỗ, mây, tre', href: '/home-living/wood-rattan' },
      { label: 'Vật liệu tái chế', href: '/home-living/recycled-materials' },
    ]},
    { title: 'Mỹ phẩm & Sức khỏe', links: [{ label: 'Chăm sóc cá nhân', href: '/home-living/personal-care' }] },
  ],
  'fashion': [{ title: 'Thời trang nam', links: [{ label: 'Áo thun', href: '/fashion/tshirt' }] }],
  'gift': [{ title: 'Quà tặng', links: [{ label: 'Quà doanh nghiệp', href: '/gift/corporate' }] }],
};

export default function NavMenu() {
  const [activeDropDown, setActiveDropdown] = useState(null);

  const navItems = [
    { id: 'food-beverage', label: 'Thực Phẩm & Đồ Uống', hasDropdown: true },
    { id: 'home-living', label: 'Gia Đình', hasDropdown: true },
    { id: 'fashion', label: 'Thời Trang', hasDropdown: true },
    { id: 'brand', label: 'Thương Hiệu', hasDropdown: false, href: '#brands' },
    { id: 'gift', label: 'Quà Tặng', hasDropdown: true },
    { id: 'collection', label: 'Bộ Sưu Tập', hasDropdown: false, href: '#collections' },
  ];

  return (
    <nav 
      className="w-full bg-white border-b border-gray-100 relative z-90"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="hidden lg:flex items-center justify-center space-x-10">
          {navItems.map((item) => (
            <div
              key={item.id}
              className="relative py-5 group"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.id)}
            >
              {/* Item Link/Button */}
              {item.hasDropdown ? (
                <button className={`text-[13px] uppercase tracking-widest font-medium transition-all duration-300 cursor-pointer flex items-center gap-1.5
                  ${activeDropDown === item.id ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}>
                  {item.label}
                  <svg 
                    className={`w-3 h-3 transition-transform duration-300 ${activeDropDown === item.id ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : (
                <a
                  href={item.href}
                  className="text-[13px] uppercase tracking-widest font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 block"
                >
                  {item.label}
                </a>
              )}

              {/* Indicator Line - Thanh gạch chân trang trí */}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 
                ${activeDropDown === item.id ? 'w-full' : 'w-0'}`} 
              />
            </div>
          ))}
        </div>
      </div>

      <DropMenu 
        isVisible={!!activeDropDown} 
        items={menuItems[activeDropDown] || []} 
        onMouseEnter={() => setActiveDropdown(activeDropDown)}
        onMouseLeave={() => setActiveDropdown(null)}
      />
    </nav>
  );
}