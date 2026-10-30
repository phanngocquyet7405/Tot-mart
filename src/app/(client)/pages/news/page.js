"use client";

import { useState } from "react";
import Link from "next/link";
import Layout from "../layout-page";
import { Clock, ArrowRight, Tag, Search, RotateCcw, BookOpen } from "lucide-react";

const CATEGORIES_BLOG = [
  "Tất cả",
  "Câu chuyện nghề",
  "Hướng dẫn chọn quà",
  "Lối sống",
  "Sau ánh đèn sân khấu",
  "Bền vững",
];

const POSTS = [
  {
    slug: "nghe-gom-bat-trang",
    category: "Câu chuyện nghề",
    title: "Người giữ lửa Bát Tràng: Khi đất sét trở thành nghệ thuật",
    excerpt:
      "Đến thăm xưởng gốm 400 năm tuổi của gia đình nghệ nhân Hoàng ở làng Bát Tràng, chúng tôi được chứng kiến đôi bàn tay kỳ diệu biến những khối đất sét thô ráp thành những tác phẩm tinh xảo.",
    author: "Lan Anh",
    date: "15 tháng 3, 2024",
    readTime: "6 phút",
    featured: true,
    emoji: "🏺",
    tags: ["Gốm", "Bát Tràng", "Nghệ nhân"],
  },
  {
    slug: "chon-qua-dip-le",
    category: "Hướng dẫn chọn quà",
    title: "5 tiêu chí chọn quà tặng ý nghĩa không bao giờ lỗi thời",
    excerpt:
      "Quà tặng đắt tiền chưa chắc đã ý nghĩa. Bài viết này chia sẻ 5 nguyên tắc đơn giản giúp bạn chọn được món quà thực sự chạm đến trái tim người nhận.",
    author: "Minh Đức",
    date: "08 tháng 3, 2024",
    readTime: "4 phút",
    featured: false,
    emoji: "🎁",
    tags: ["Quà tặng", "Tips", "Ý nghĩa"],
  },
  {
    slug: "tra-sen-tay-ho",
    category: "Câu chuyện nghề",
    title: "Một ngày cùng người hái sen lúc bình minh trên Hồ Tây",
    excerpt:
      "4 giờ sáng, khi Hà Nội còn say ngủ, những người phụ nữ đã chèo thuyền ra giữa hồ. Họ thu hoạch từng bông sen tươi, cẩn thận nhét trà vào nhụy trước khi mặt trời mọc.",
    author: "Thu Hà",
    date: "25 tháng 2, 2024",
    readTime: "8 phút",
    featured: false,
    emoji: "🌸",
    tags: ["Trà sen", "Hồ Tây", "Hà Nội"],
  },
  {
    slug: "song-minimalist",
    category: "Lối sống",
    title: "Tối giản có tâm: Cách người Nhật chọn đồ dùng trong nhà",
    excerpt:
      "Triết lý wabi-sabi và kintsugi không chỉ là xu hướng thẩm mỹ — đó là cách sống trân trọng sự không hoàn hảo và vẻ đẹp của vật liệu tự nhiên.",
    author: "Lan Anh",
    date: "18 tháng 2, 2024",
    readTime: "5 phút",
    featured: false,
    emoji: "🎋",
    tags: ["Minimalism", "Wabi-sabi", "Phong cách sống"],
  },
  {
    slug: "sap-hoi-an",
    category: "Sau ánh đèn sân khấu",
    title: "Từ garage đến 50.000 khách hàng: Câu chuyện xà phòng Hội An",
    excerpt:
      "Chị Nguyễn Thị Mai bắt đầu làm xà phòng trong nhà bếp với 500.000đ vốn ban đầu. 6 năm sau, thương hiệu của chị có mặt trong 8 quốc gia.",
    author: "Quốc Bảo",
    date: "10 tháng 2, 2024",
    readTime: "7 phút",
    featured: false,
    emoji: "🧼",
    tags: ["Khởi nghiệp", "Hội An", "Thành công"],
  },
  {
    slug: "bao-bi-xanh",
    category: "Bền vững",
    title: "Vì sao TotMart chuyển sang bao bì 100% tái chế",
    excerpt:
      "Hành trình 18 tháng tìm kiếm giải pháp bao bì thay thế: từ những thất bại đầu tiên đến khi ra mắt dòng hộp carton tái chế độc quyền từ rừng trồng có chứng nhận.",
    author: "Thu Hà",
    date: "01 tháng 2, 2024",
    readTime: "5 phút",
    featured: false,
    emoji: "♻️",
    tags: ["Bền vững", "Môi trường", "Bao bì"],
  },
];

function FeaturedPost({ post }) {
  return (
    <article className="group grid md:grid-cols-2 gap-0 bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/40 transition-all shadow-xs">
      <div className="h-56 md:h-auto bg-muted/50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-border">
        <span className="text-7xl sm:text-8xl select-none" role="img" aria-label={post.title}>
          {post.emoji}
        </span>
      </div>
      <div className="p-6 sm:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Featured
          </span>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {post.category}
          </span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3 max-w-[65ch]">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={13} />
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function PostCard({ post }) {
  return (
    <article className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs">
      <div>
        <div className="h-44 bg-muted/40 flex items-center justify-center border-b border-border">
          <span className="text-5xl select-none" role="img" aria-label={post.title}>
            {post.emoji}
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
          </div>
          <h3 className="font-serif text-lg text-foreground font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4 max-w-[65ch]">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md"
              >
                <Tag size={10} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{post.date}</span>
        <div className="flex items-center gap-1 text-primary font-medium group-hover:translate-x-0.5 transition-transform">
          <span>{post.readTime}</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const [category, setCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");

  const featured = POSTS.find((p) => p.featured);
  const rest = POSTS.filter((p) => !p.featured);

  const filtered = rest.filter(
    (p) =>
      (category === "Tất cả" || p.category === category) &&
      (!search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Layout>
      <title>Blog – TotMart</title>
      <meta
        name="description"
        content="Câu chuyện nghề, hướng dẫn chọn quà và góc nhìn về lối sống tối giản từ đội ngũ TotMart."
      />

      {/* Hero */}
      <section className="bg-card/60 border-b border-border py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
            TotMart Blog
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground mb-5 leading-tight tracking-tight">
            Những câu chuyện
            <br />
            <em className="text-primary italic">đáng kể</em>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xl mx-auto">
            Từ xưởng thợ đến bàn ăn, từ bàn tay nghệ nhân đến trái tim người
            nhận — chúng tôi kể những câu chuyện thật.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-8">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm kiếm bài viết"
              className="w-full min-h-11 pl-12 pr-4 py-2.5 rounded-2xl border border-input bg-background text-sm text-foreground
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-6xl mx-auto px-6 py-8 border-b border-border">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES_BLOG.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-11 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-12 pb-24">
        {filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 px-6 bg-card border border-border rounded-3xl max-w-lg mx-auto">
            <BookOpen size={40} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Không tìm thấy bài viết phù hợp.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("Tất cả");
              }}
              className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-xl transition-colors hover:underline"
            >
              <RotateCcw size={14} />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post */}
            {featured && (
              <div>
                <FeaturedPost post={featured} />
              </div>
            )}

            {/* Grid Posts */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-16 bg-card border border-border rounded-3xl p-8 sm:p-10 text-center shadow-xs">
          <p className="font-serif text-2xl text-foreground mb-3">
            Không bỏ lỡ câu chuyện mới
          </p>
          <p className="text-muted-foreground text-sm mb-7 max-w-md mx-auto leading-relaxed">
            Mỗi tuần một bài — câu chuyện nghề thủ công, lối sống và quà tặng có
            ý nghĩa.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col sm:flex-row max-w-sm mx-auto gap-3"
          >
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-11"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors whitespace-nowrap min-h-11"
            >
              Theo dõi
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
