import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
// API_URL belongs to the Next server only. Browser traffic always uses /api.
const configuredApiUrl = process.env.API_URL;
if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api') {
  throw new Error('NEXT_PUBLIC_API_URL must be /api; configure the backend with server-only API_URL');
}
const apiUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, "")
  : null;

if (process.env.NODE_ENV === "production" && !apiUrl) throw new Error("API_URL is required for production builds");

if (apiUrl) {
  if (!/^https?:\/\//.test(apiUrl))
    throw new Error("API_URL must be an absolute http(s) URL");

  const target = new URL(apiUrl);
  if (target.pathname !== '/api') throw new Error('API_URL must end with exactly /api (not /api/api) for the TotMart backend');
  if (/^(?:.*\.)?(?:example\.com|example\.org|example\.net)$/.test(target.hostname)) throw new Error('API_URL is a placeholder; configure the actual backend for this deployment scope');
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
  distDir: process.env.TOTMART_TEST_DIST === '1' ? '.cache/next-test' : process.env.TOTMART_TEST_DIST === 'build' ? '.cache/next-build' : '.next',
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
    const isReportOnlyScope =
      process.env.TOTMART_CSP_REPORT_ONLY === "1" ||
      process.env.TOTMART_ENV === "staging" ||
      process.env.APP_ENV === "staging" ||
      process.env.CI === "true";

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data: https://fonts.gstatic.com",
      `img-src 'self' data: blob: ${hosts.map((h) => "https://" + h).join(" ")}`,
      "connect-src 'self' https: http://localhost:*",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(isReportOnlyScope ? ["report-uri /csp-report"] : []),
    ].join("; ");

    const commonHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ];

    if (isReportOnlyScope) {
      commonHeaders.push({
        key: "Content-Security-Policy-Report-Only",
        value: cspDirectives,
      });
    }

    const publicCatalogRoutes = [
      "/",
      "/homepage",
      "/products",
      "/products/:path*",
      "/brands",
      "/brands/:path*",
      "/categories",
      "/categories/:path*",
      "/box",
      "/box/:path*",
    ];

    const privateRoutes = [
      "/checkout",
      "/checkout/:path*",
      "/cart",
      "/cart/:path*",
      "/profile",
      "/profile/:path*",
    ];

    const sessionCookieMissing = [
      { type: "cookie", key: "token" },
      { type: "cookie", key: "refreshToken" },
    ];

    return [
      {
        source: "/:path*",
        headers: commonHeaders,
      },
      ...publicCatalogRoutes.map((source) => ({
        source,
        missing: sessionCookieMissing,
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
          {
            key: "Vary",
            value: "Accept-Encoding, Cookie",
          },
        ],
      })),
      ...publicCatalogRoutes.map((source) => ({
        source,
        has: [{ type: "cookie", key: "token" }],
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "Vary",
            value: "Accept-Encoding, Cookie",
          },
        ],
      })),
      ...publicCatalogRoutes.map((source) => ({
        source,
        has: [{ type: "cookie", key: "refreshToken" }],
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "Vary",
            value: "Accept-Encoding, Cookie",
          },
        ],
      })),
      ...privateRoutes.map((source) => ({
        source,
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      })),
    ];
  },
});
