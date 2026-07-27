import type { MetadataRoute } from "next";
import { monthsWithPosts, sitemapArtists, sitemapTags } from "@/lib/db";
import { artistPath, tagPath } from "@/lib/paths";
import { SITE_URL } from "@/lib/site";

// DBの内容から生成するため常に動的（クローラは健全版しか見ないので健全版のみ列挙）
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/ranking`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/students`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/removal`, changeFrequency: "yearly", priority: 0.2 },
  ];

  for (const t of sitemapTags()) {
    entries.push({
      url: `${SITE_URL}${tagPath(t.name)}`,
      lastModified: new Date(t.last * 1000),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }
  for (const a of sitemapArtists()) {
    entries.push({
      url: `${SITE_URL}${artistPath(a.screen_name)}`,
      lastModified: new Date(a.last * 1000),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  for (const m of monthsWithPosts("all")) {
    entries.push({
      url: `${SITE_URL}/ranking/${m}`,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }
  return entries;
}
