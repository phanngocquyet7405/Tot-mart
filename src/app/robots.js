import { getPublicSiteUrl } from "@/app/services/server/serverCatalog";

export default function robots() {
  const isStaging =
    process.env.APP_ENV === "staging" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.TOTMART_ENV === "staging";

  if (isStaging) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = getPublicSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin-*",
        "/dashboard",
        "/checkout",
        "/checkout/*",
        "/profile",
        "/profile/*",
        "/cart",
        "/login",
        "/register",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
