import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { studentEntries } from "@/lib/db";
import { resolveToken } from "@/lib/normalize";
import { tagPath } from "@/lib/paths";
import BrowsePage from "@/components/BrowsePage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function displayName(raw: string): string {
  const name = decodeURIComponent(raw);
  const r = resolveToken(name, studentEntries());
  return r.ok ? r.name : name;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = displayName((await params).name);
  const title = `${name}のイラスト一覧 | ${SITE_NAME}`;
  return {
    title: { absolute: title },
    openGraph: { title, url: tagPath(name) },
    description: `ブルーアーカイブ ${name} のファンアートまとめ。X(旧Twitter)の${name}イラストをまとめて閲覧できます。`,
    // 表記ゆれURL(ひらがな等)や ?sort= ?page= 付きは正規名のタグページに集約
    alternates: { canonical: tagPath(name) },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const name = decodeURIComponent((await params).name);
  const sp = await searchParams;
  const sort = typeof sp.sort === "string" ? sp.sort : "new";
  const page = Math.max(1, Number(sp.page) || 1);
  return <BrowsePage rawTags={[name]} sort={sort} page={page} />;
}
