import ProductSection from './product_section';
import TotMartSupport from './totmart_suppport';
import ProductCategoriesShowcase from './home/product_categories_showcase';

export default function TotmartLanding() {
  return (
    <>
      {/* Product Categories Showcase */}
      <ProductCategoriesShowcase />

      {/* Nhóm sản phẩm 1 */}
      <ProductSection 
        title="Hạt Dinh Dưỡng Cao Cấp"
        subtitle="Năng lượng từ thiên nhiên"
        description="Sự kết hợp hoàn hảo giữa độ giòn tan và giá trị dinh dưỡng vượt trội cho sức khỏe gia đình bạn."
        imageSrc="/assets/pr_test_1.webp"
      />

      {/* Nhóm sản phẩm 2 (Đảo ngược vị trí & Nền tối) */}
      <ProductSection 
        title="Trái Cây Sấy Dẻo"
        subtitle="Vị ngọt thuần khiết"
        description="Giữ trọn hương vị tự nhiên của trái cây tươi vùng nhiệt đới, không đường hóa học, không chất bảo quản."
        imageSrc="/assets/pr_test_2.avif"
        isDark={true}
        reverse={true}
      />

      {/* Nhóm sản phẩm 3 */}
      <ProductSection 
        title="Set Quà Tặng Ý Nghĩa"
        subtitle="Gửi trọn tâm tình"
        description="Những hộp quà sang trọng, tinh tế thay lời chúc sức khỏe gửi đến người thân, bạn bè và đối tác."
        imageSrc="/assets/pr_test_3.webp"
      />

      {/* Phần FAQ và Newsletter */}
      <TotMartSupport />
    </>
  );
}
