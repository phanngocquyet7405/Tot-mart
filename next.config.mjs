/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Thêm cấu hình cho v0 và Unsplash (vì v0 thường lấy ảnh từ đây)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "v0.blob.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
