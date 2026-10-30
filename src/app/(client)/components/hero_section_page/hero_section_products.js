export default function HeroSectionProduct() {
  return (
    <div className="relative bg-card rounded-2xl overflow-hidden mb-8 p-8 md:p-12 border border-border shadow-xs">
      <div className="relative z-10 max-w-3xl">
        <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary mb-4 uppercase tracking-wider">
          Lựa chọn hữu cơ cao cấp
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 leading-tight">
          Khám phá đồ ăn nhẹ hữu cơ cao cấp
        </h1>

        <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
          Khám phá bộ sưu tập đồ ăn nhẹ hữu cơ được tuyển chọn kỹ lưỡng, chăm chút
          và đến từ các nhà sản xuất bền vững, có đạo đức trên toàn thế giới.
        </p>

        <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:scale-105">
          Khám phá bộ sưu tập
        </button>
      </div>
    </div>
  );
}
