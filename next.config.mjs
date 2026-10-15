import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
const configuredApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
const apiUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, "")
  : null;

if (process.env.NODE_ENV === "production" && !apiUrl) throw new Error("API_URL is required for production builds");

if (apiUrl) {
  if (!/^https?:\/\//.test(apiUrl))
    throw new Error("API_URL must be an absolute http(s) URL");

  const target = new URL(apiUrl);
  if (
    process.env.NODE_ENV === "production" &&
    process.env.CI !== "true" &&
    (target.protocol !== "https:" ||
      /^(localhost(?:\.|$)|127\.|0\.0\.0\.0$|\[::1\]$)/.test(
        target.hostname,
      ))
  )
    throw new Error("Production API_URL must use an HTTPS remote host");
  if (target.username || target.password || target.search || target.hash)
    throw new Error("API_URL cannot contain credentials/query/hash");
}
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
    return apiUrl
      ? [{ source: "/api/:path*", destination: apiUrl + "/:path*" }]
      : [];
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
