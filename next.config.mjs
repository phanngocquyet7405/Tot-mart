import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
const apiUrl = (process.env.API_URL || "http://localhost:3001/api").replace(
  /\/$/,
  "",
);
if (!/^https?:\/\//.test(apiUrl))
  throw new Error("API_URL must be an absolute http(s) URL");
if (process.env.NODE_ENV === "production" && !process.env.API_URL)
  throw new Error("Set API_URL for production builds");
const hosts = (
  process.env.IMAGE_HOSTS ||
  "res.cloudinary.com,images.unsplash.com,qr.sepay.vn,img.vietqr.io"
)
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);
export default withNextIntl({
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  experimental:
    process.env.BUILD_WORKER_THREADS === "1"
      ? { workerThreads: true, cpus: 1, webpackBuildWorker: false }
      : {},
  reactCompiler: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: apiUrl + "/:path*" }];
  },
  images: {
    remotePatterns: hosts.map((hostname) => ({ protocol: "https", hostname })),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
});
