import Link from "next/link";
import { studentsGrouped } from "@/lib/db";
import { getMode } from "@/lib/mode";
import { tagPath } from "@/lib/paths";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import FollowButton from "@/components/FollowButton";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "キャラ一覧",
  description: `ブルーアーカイブの生徒(キャラ)別ファンアート索引。所属ごとにイラストの掲載件数つきで一覧できます | ${SITE_NAME}`,
  alternates: { canonical: "/students" },
};

export default async function StudentsPage() {
  const groups = studentsGrouped(await getMode());
  const totalStudents = groups.reduce((n, g) => n + g.students.length, 0);
  const totalPosts = groups.reduce(
    (n, g) => n + g.students.reduce((m, s) => m + s.count, 0),
    0
  );

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "キャラ一覧",
          url: `${SITE_URL}/students`,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "キャラ一覧", item: `${SITE_URL}/students` },
            ],
          },
        }}
      />
      <h1 className="ba-heading mb-1 text-xl">キャラ一覧</h1>
      <p className="mb-2 text-sm text-gray-500">
        名前をクリックするとイラスト一覧へ。フォローすると
        <Link href="/following" className="text-sky-600 hover:underline">
          フォロー中
        </Link>
        ページと通知で新着を追えます。
      </p>
      <p className="mb-4 text-xs text-gray-400">
        {totalStudents}名 / 掲載イラスト {totalPosts}件
      </p>

      {/* 陣営ジャンプナビ */}
      <nav
        className="mb-6 flex flex-wrap gap-1.5 text-xs"
        aria-label="所属へジャンプ"
      >
        {groups.map((g) => (
          <a
            key={g.school}
            href={`#school-${encodeURIComponent(g.school)}`}
            className="rounded-full bg-white px-3 py-1 text-sky-700 shadow-sm hover:bg-sky-50"
          >
            {g.school}
            <span className="ml-1 tabular-nums text-gray-400">
              {g.students.reduce((n, s) => n + s.count, 0)}
            </span>
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        {groups.map((g) => (
          <section
            key={g.school}
            id={`school-${encodeURIComponent(g.school)}`}
            className="scroll-mt-20"
          >
            <h2 className="ba-heading mb-2 text-sm text-gray-600">
              {g.school}
              <span className="ml-2 text-xs font-normal tabular-nums text-gray-400">
                {g.students.length}名 / {g.students.reduce((n, s) => n + s.count, 0)}件
              </span>
            </h2>
            <ul className="flex flex-wrap gap-2">
              {g.students.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center gap-2 rounded-full bg-white py-1 pl-3 pr-1.5 shadow-sm"
                >
                  <Link
                    href={tagPath(s.name)}
                    className="text-sm text-sky-700 hover:underline"
                  >
                    {s.name}
                    <span className="ml-1 text-xs tabular-nums text-gray-400">{s.count}</span>
                  </Link>
                  <FollowButton name={s.name} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
