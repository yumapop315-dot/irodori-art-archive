// トップページとタグ別ページ(/tag/◯◯)の共通表示（サーバーコンポーネント）
import Link from "next/link";
import { getMode } from "@/lib/mode";
import {
  allStudents,
  popularTags,
  relatedTags,
  searchPosts,
  studentEntries,
  toJson,
  topArtistsForTag,
} from "@/lib/db";
import { resolveToken } from "@/lib/normalize";
import { artistPath, tagPath } from "@/lib/paths";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import PostGrid from "@/components/PostGrid";
import Pagination from "@/components/Pagination";
import SearchForm from "@/components/SearchForm";
import AdSlot from "@/components/AdSlot";
import DlsiteSlot from "@/components/DlsiteSlot";
import JsonLd from "@/components/JsonLd";

const PER_PAGE = 50;

const SORT_LABELS: [string, string][] = [
  ["new", "登録順"],
  ["posted_at", "投稿日順"],
  ["daily", "人気順(24時間)"],
  ["monthly", "人気順(月間)"],
  ["latest_favorites", "最新いいね"],
  ["random", "ランダム"],
];

export default async function BrowsePage({
  rawTags,
  sort,
  page = 1,
}: {
  rawTags: string[];
  sort: string;
  page?: number;
}) {
  const mode = await getMode();
  const students = studentEntries();

  const resolved: string[] = [];
  const unresolved: { token: string; candidates: string[] }[] = [];
  for (const t of rawTags) {
    const r = resolveToken(t, students);
    if (r.ok) resolved.push(r.name);
    else unresolved.push({ token: r.token, candidates: r.candidates });
  }

  const { posts, total } =
    unresolved.length > 0
      ? { posts: [], total: 0 }
      : searchPosts({ tags: resolved, sort, page, perPage: PER_PAGE, rating: mode, taggedOnly: true });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const studentOptions = allStudents().map((s) => ({
    name: s.name,
    school: s.school,
    aliases: s.aliases ? s.aliases.split(",").filter(Boolean) : [],
  }));
  const popular = popularTags(10, mode);
  const singleTag = resolved.length === 1 && unresolved.length === 0 ? resolved[0] : null;
  const related = singleTag ? relatedTags(singleTag, mode) : [];
  const topArtists = singleTag ? topArtistsForTag(singleTag, mode) : [];

  // リンク先生成: タグ1つならまとめサイト風パス、複数ならクエリ
  const buildHref = (sortKey: string, pageNum: number) => {
    const qp = new URLSearchParams();
    if (sortKey !== "new") qp.set("sort", sortKey);
    if (pageNum > 1) qp.set("page", String(pageNum));
    if (resolved.length === 1 && unresolved.length === 0) {
      const s = qp.toString();
      return `${tagPath(resolved[0])}${s ? `?${s}` : ""}`;
    }
    if (rawTags.length > 0) qp.set("tags", rawTags.join(","));
    const s = qp.toString();
    return s ? `/?${s}` : "/";
  };
  const sortHref = (key: string) => buildHref(key, 1);

  return (
    <div>
      {singleTag && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${singleTag}のイラスト一覧`,
            url: `${SITE_URL}${tagPath(singleTag)}`,
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "キャラ一覧",
                  item: `${SITE_URL}/students`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: singleTag,
                  item: `${SITE_URL}${tagPath(singleTag)}`,
                },
              ],
            },
          }}
        />
      )}
      <div className="mb-3 flex justify-center">
        <SearchForm
          key={`${rawTags.join(",")}|${sort}`}
          students={studentOptions}
          initialChips={unresolved.length === 0 ? resolved : rawTags}
          sort={sort}
        />
      </div>

      {popular.length > 0 && rawTags.length === 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-gray-400">人気タグ:</span>
          {popular.map((p) => (
            <Link
              key={p.name}
              href={tagPath(p.name)}
              className="rounded-full bg-white px-3 py-1 text-sky-700 shadow-sm hover:bg-sky-50"
            >
              {p.name} <span className="text-gray-400">{p.count}</span>
            </Link>
          ))}
          <Link href="/students" className="px-1 text-sky-600 hover:underline">
            キャラ一覧 →
          </Link>
        </div>
      )}

      <nav className="mb-5 flex flex-wrap justify-center gap-2 text-sm" aria-label="並び替え">
        {SORT_LABELS.map(([key, label]) => (
          <Link
            key={key}
            href={sortHref(key)}
            className={`ba-chip px-4 py-1.5 ${sort === key ? "ba-chip-active" : ""}`}
          >
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {resolved.length > 0 && (
        <p className="mb-2 text-center text-sm text-gray-600">
          「{resolved.join("・")}」のイラスト: {total}件{" "}
          <Link href="/" className="text-sky-600 hover:underline">
            クリア
          </Link>
        </p>
      )}

      {related.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-gray-400">{resolved[0]}とよく一緒に描かれる:</span>
          {related.map((r) => (
            <Link
              key={r.name}
              href={`/?tags=${encodeURIComponent(`${resolved[0]},${r.name}`)}`}
              className="rounded-full bg-white px-3 py-1 text-sky-700 shadow-sm hover:bg-sky-50"
              title={`${resolved[0]}と${r.name}が一緒に描かれたイラスト（${r.count}件）`}
            >
              {r.name} <span className="text-gray-400">{r.count}</span>
            </Link>
          ))}
        </div>
      )}

      {topArtists.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-gray-400">{singleTag}をよく描く絵師:</span>
          {topArtists.map((a) => (
            <Link
              key={a.screen_name}
              href={artistPath(a.screen_name)}
              className="rounded-full bg-white px-3 py-1 text-sky-700 shadow-sm hover:bg-sky-50"
              title={`${a.author_name}さんの${singleTag}のイラスト（${a.count}件）`}
            >
              {a.author_name} <span className="text-gray-400">{a.count}</span>
            </Link>
          ))}
        </div>
      )}

      {unresolved.length > 0 && (
        <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {unresolved.map((u) => (
            <div key={u.token}>
              <p>
                「{u.token}」に一致するキャラが見つかりませんでした。
                {u.candidates.length > 0 && " もしかして:"}
              </p>
              {u.candidates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {u.candidates.map((c) => (
                    <Link
                      key={c}
                      href={tagPath(c)}
                      className="rounded-full bg-white px-3 py-1 text-xs text-sky-700 shadow-sm hover:bg-sky-50"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {unresolved.length === 0 && (
        <>
          {total > PER_PAGE && (
            <p className="mb-3 text-center text-xs text-gray-400">
              {total}件中 {(page - 1) * PER_PAGE + 1}〜{Math.min(page * PER_PAGE, total)}件目
            </p>
          )}
          <PostGrid
            posts={posts.map(toJson)}
            showAds={mode === "all"}
            promo={<DlsiteSlot mode={mode} character={singleTag} variant="infeed" />}
            emptyMessage="イラストが見つかりませんでした。"
          />
          <Pagination
            current={page}
            totalPages={totalPages}
            hrefFor={(p) => buildHref(sort, p)}
          />
        </>
      )}

      <div className="mt-8">
        {mode === "all" ? (
          <AdSlot variant="banner" />
        ) : (
          <DlsiteSlot mode={mode} character={singleTag} />
        )}
      </div>
    </div>
  );
}
