import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { studentEntries } from "@/lib/db";
import { resolveToken } from "@/lib/normalize";
import { tagPath } from "@/lib/paths";
import BrowsePage from "@/components/BrowsePage";

export const dynamic = "force-dynamic";

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

function parseParams(sp: { [key: string]: string | string[] | undefined }) {
  const tags =
    typeof sp.tags === "string" && sp.tags ? sp.tags.split(",").filter(Boolean) : [];
  const sort = typeof sp.sort === "string" ? sp.sort : "new";
  const page = Math.max(1, Number(sp.page) || 1);
  return { tags, sort, page };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { tags } = parseParams(await searchParams);
  if (tags.length === 0) return { alternates: { canonical: "/" } };

  // 表記ゆれを正規名に解決してcanonicalを一本化（単一タグは /tag/◯◯ に集約）
  const resolved = tags.map((t) => {
    const r = resolveToken(t, studentEntries());
    return r.ok ? r.name : t;
  });
  const canonical =
    resolved.length === 1
      ? tagPath(resolved[0])
      : `/?tags=${encodeURIComponent(resolved.join(","))}`;

  const title = `${resolved.join("・")}のイラスト一覧 | ${SITE_NAME}`;
  return {
    title: { absolute: title },
    openGraph: { title },
    alternates: { canonical },
  };
}

export default async function Home({ searchParams }: { searchParams: SP }) {
  const { tags, sort, page } = parseParams(await searchParams);
  return <BrowsePage rawTags={tags} sort={sort} page={page} />;
}
