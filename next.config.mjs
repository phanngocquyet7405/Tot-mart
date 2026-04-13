/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Cho phép tất cả các trang web sử dụng https
      },
      {
        protocol: "http",
        hostname: "**", // Cho phép tất cả các trang web sử dụng http
      },
    ],
  },
};

export default nextConfig;
