import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 管理画面・登録画面・APIと、個人用ページ（中身がlocalStorage依存で空になる）は除外
        disallow: ["/admin", "/register", "/api/", "/favorites", "/following", "/mutes"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
