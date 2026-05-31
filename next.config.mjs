/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Proxy mọi request /api/* → backend thật để tránh CORS
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://totmartapi.onrender.com/api"}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "v0.blob.com", // Lưu ý: v0 thường dùng v0.blob.com hoặc tên miền tương tự
        pathname: "/**",
      },
      // Thêm domain đang gây lỗi để test
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      // Nếu bạn muốn cho phép TOÀN BỘ internet (cẩn thận về bảo mật)
      // {
      //   protocol: "https",
      //   hostname: "**",
      // },
    ],
  },
};

export default nextConfig;
