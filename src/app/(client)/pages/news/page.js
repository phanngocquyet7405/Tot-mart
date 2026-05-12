"use client";

import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import Layout from "../layout-page";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../../components/ui/footer";
import CartDrawer from "../../components/Cart_component/cart_drawer";
import { Clock, ArrowRight, Tag, Search, BookOpen } from "lucide-react";

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
    color: "from-amber-100 to-stone-200",
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
    color: "from-rose-100 to-pink-200",
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
    color: "from-pink-100 to-purple-200",
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
    color: "from-green-100 to-teal-200",
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
    color: "from-amber-50 to-orange-200",
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
    color: "from-lime-100 to-green-200",
    tags: ["Bền vững", "Môi trường", "Bao bì"],
  },
];

const COLOR_MAP = {
  "Câu chuyện nghề": "bg-amber-100 text-amber-800",
  "Hướng dẫn chọn quà": "bg-rose-100 text-rose-800",
  "Lối sống": "bg-purple-100 text-purple-800",
  "Sau ánh đèn sân khấu": "bg-orange-100 text-orange-800",
  "Bền vững": "bg-green-100 text-green-800",
};

function FeaturedPost({ post }) {
  return (
    <Link
      href={`/pages/our-blog/${post.slug}`}
      className="group grid md:grid-cols-2 gap-0 bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all"
    >
      <div
        className={`h-56 md:h-auto bg-linear-to-br ${post.color} flex items-center justify-center`}
      >
        <span className="text-8xl">{post.emoji}</span>
      </div>
      <div className="p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Featured
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${COLOR_MAP[post.category] || "bg-stone-100 text-stone-600"}`}
          >
            {post.category}
          </span>
        </div>
        <h2 className="font-serif text-2xl text-stone-900 leading-snug mb-3 group-hover:text-amber-800 transition-colors">
          {post.title}
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed mb-5 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <Clock size={11} />
            <span>{post.readTime}</span>
          </div>
          <ArrowRight
            size={16}
            className="text-amber-700 group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }) {
  return (
    <Link
      href={`/pages/our-blog/${post.slug}`}
      className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-amber-200 hover:shadow-md transition-all flex flex-col"
    >
      <div
        className={`h-40 bg-linear-to-br ${post.color} flex items-center justify-center`}
      >
        <span className="text-6xl">{post.emoji}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span
          className={`self-start text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${COLOR_MAP[post.category] || "bg-stone-100 text-stone-600"}`}
        >
          {post.category}
        </span>
        <h3 className="font-semibold text-stone-900 text-base leading-snug mb-2 group-hover:text-amber-800 transition-colors flex-1">
          {post.title}
        </h3>
        <p className="text-stone-500 text-xs leading-relaxed mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 text-xs text-stone-400 pt-3 border-t border-stone-100">
          <Clock size={11} />
          <span>{post.readTime}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>
      </div>
    </Link>
  );
}

export default function OurBlogPage() {
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
      <Head>
        <title>Blog – TotMart</title>
        <meta
          name="description"
          content="Câu chuyện nghề, hướng dẫn chọn quà và góc nhìn về lối sống tối giản từ đội ngũ TotMart."
        />
      </Head>

      {/* Hero */}
      <section className="bg-[#f5f0e8] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full mb-6">
            TotMart Blog
          </span>
          <h1 className="font-serif text-5xl text-stone-900 mb-5 leading-tight">
            Những câu chuyện
            <br />
            <em className="text-amber-800">đáng kể</em>
          </h1>
          <p className="text-stone-600 text-base leading-relaxed max-w-xl mx-auto">
            Từ xưởng thợ đến bàn ăn, từ bàn tay nghệ nhân đến trái tim người
            nhận — chúng tôi kể những câu chuyện thật.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Featured */}
        {featured && category === "Tất cả" && !search && (
          <div className="mb-10">
            <FeaturedPost post={featured} />
          </div>
        )}

        {/* Search + Category filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES_BLOG.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                  ${category === c ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Không tìm thấy bài viết phù hợp.</p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("Tất cả");
              }}
              className="mt-3 text-amber-700 text-sm font-semibold hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-16 bg-stone-900 rounded-3xl p-10 text-center">
          <p className="font-serif text-2xl text-white mb-3">
            Không bỏ lỡ câu chuyện mới
          </p>
          <p className="text-stone-400 text-sm mb-7">
            Mỗi tuần một bài — câu chuyện nghề thủ công, lối sống và quà tặng có
            ý nghĩa.
          </p>
          <div className="flex max-w-sm mx-auto gap-3">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-500"
            />
            <button className="px-5 py-3 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap">
              Theo dõi
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
