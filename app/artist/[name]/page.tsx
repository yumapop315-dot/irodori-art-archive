import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authorInfo, searchPosts, toJson } from "@/lib/db";
import { getMode } from "@/lib/mode";
import { SITE_NAME } from "@/lib/site";
import PostGrid from "@/components/PostGrid";
import { isAdminRequest } from "@/lib/adminAuth";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SORT_LABELS: [string, string][] = [
  ["new", "登録順"],
  ["posted_at", "投稿日順"],
  ["monthly", "人気順"],
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent((await params).name);
  const info = authorInfo(name, await getMode());
  const display = info?.author_name ?? name;
  const title = `${display}さんのイラスト一覧 | ${SITE_NAME}`;
  return {
    title: { absolute: title },
    openGraph: { title },
    description: `${display}さん(@${name})のブルーアーカイブ ファンアートまとめ。`,
    alternates: { canonical: `/artist/${encodeURIComponent(name)}` },
  };
}

export default async function ArtistPage({ params, searchParams }: Props) {
  const screenName = decodeURIComponent((await params).name);
  const sp = await searchParams;
  const sort = typeof sp.sort === "string" ? sp.sort : "new";
  const page = Math.max(1, Number(sp.page) || 1);
  const mode = await getMode();

  const info = authorInfo(screenName, mode);
  if (!info) notFound();

  const PER_PAGE = 50;
  const { posts, total } = searchPosts({
    tags: [],
    sort,
    page,
    perPage: PER_PAGE,
    rating: mode,
    publicOnly: true,
    author: screenName,
  });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hrefFor = (p: number) => {
    const q = new URLSearchParams();
    if (sort !== "new") q.set("sort", sort);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return `/artist/${encodeURIComponent(screenName)}${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h1 className="ba-heading text-xl">{info.author_name} さんのイラスト</h1>
        <a
          href={`https://x.com/${info.screen_name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-sky-600 shadow-sm hover:bg-sky-50"
        >
          @{info.screen_name} をXで見る
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-500">掲載 {info.count} 件</p>

      <nav className="mb-5 flex flex-wrap gap-2 text-sm" aria-label="並び替え">
        {SORT_LABELS.map(([key, label]) => (
          <Link
            key={key}
            href={key === "new" ? `/artist/${encodeURIComponent(screenName)}` : `/artist/${encodeURIComponent(screenName)}?sort=${key}`}
            className={`ba-chip px-4 py-1.5 ${sort === key ? "ba-chip-active" : ""}`}
          >
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <PostGrid posts={posts.map(toJson)} isAdmin={await isAdminRequest()} />
      <Pagination current={page} totalPages={totalPages} hrefFor={hrefFor} />
    </div>
  );
}
