import Link from "next/link";
import { allSchools, allStudents, listRemovalRequests, searchPosts, studentEntries, toJson } from "@/lib/db";
import { isAdminRequest } from "@/lib/adminAuth";
import { suggestTagsFromText } from "@/lib/normalize";
import AdminLogin from "@/components/AdminLogin";
import AdminPostList from "@/components/AdminPostList";
import { CheckDeadButton, LogoutButton, RemovalRow } from "@/components/AdminTools";
import StudentManager from "@/components/StudentManager";

export const dynamic = "force-dynamic";

export const metadata = { title: "管理画面" };

const FILTERS: [string, string][] = [
  ["all", "すべて"],
  ["untagged", "タグ未設定"],
  ["auto", "自動タグ"],
  ["sensitive", "きわどい"],
  ["r18", "R18"],
  ["dead", "消滅"],
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!(await isAdminRequest())) return <AdminLogin />;

  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : "all";
  const page = Math.max(1, Number(sp.page) || 1);

  const { posts, total } = searchPosts({
    tags: [],
    sort: "new",
    page,
    perPage: 50,
    status: filter === "dead" ? "dead" : "all",
    untaggedOnly: filter === "untagged",
    autoTaggedOnly: filter === "auto",
    rating: filter === "r18" || filter === "sensitive" ? filter : "any",
  });

  const students = allStudents().map((s) => ({
    name: s.name,
    school: s.school,
    aliases: s.aliases ? s.aliases.split(",").filter(Boolean) : [],
  }));
  const entries = studentEntries();
  const removals = listRemovalRequests();
  const pending = removals.filter((r) => r.resolved === 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="ba-heading text-xl">管理画面</h1>
        <div className="flex items-center gap-2">
          <CheckDeadButton />
          <LogoutButton />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <p className="mb-1 font-bold">タグの付け方</p>
        <ol className="list-inside list-decimal space-y-1 text-sky-800">
          <li>
            投稿者がハッシュタグ等でキャラを明示していれば、登録時に<b>自動でタグ付け</b>されます。
            ただし<b>この段階ではまだ非公開</b>です。「自動タグ」フィルタで中身を確認し、
            正しければ<b>「確認して公開」</b>、違えば修正して保存してください
          </li>
          <li>「タグ未設定」フィルタで、自動判定できなかった投稿だけに絞り込む</li>
          <li>
            緑色の「+キャラ名」候補をクリックで追加、または入力欄から選ぶ（ひらがな可）。
            複数選んで<b>下部バーから一括付与</b>もできます（「この作者を選択」で同じ絵師をまとめて）
          </li>
          <li>「保存」を押すと確定。付けたタグは ✕ で外せます</li>
        </ol>
        <p className="mt-2 text-xs text-sky-700">
          左端バッジ:
          <span className="mx-1 font-bold text-emerald-700">緑=公開中</span>/
          <span className="mx-1 font-bold text-gray-600">灰色=非公開</span>/
          <span className="mx-1 font-bold text-violet-700">紫=自動タグ（未確認・非公開）</span>。
          管理人が保存／確認した時点で公開されます。複数選択すれば下部バーからまとめて公開できます。
        </p>
      </div>

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-bold text-amber-700">
            未対応の削除依頼: {pending.length}件
          </h2>
          <div className="space-y-2">
            {removals.map((r) => (
              <RemovalRow key={r.id} req={r} />
            ))}
          </div>
        </section>
      )}

      <div className="mb-6">
        <StudentManager students={students} schools={allSchools()} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        {FILTERS.map(([key, label]) => (
          <Link
            key={key}
            href={key === "all" ? "/admin" : `/admin?filter=${key}`}
            className={`rounded-full px-4 py-1.5 ${
              filter === key
                ? "bg-sky-500 font-semibold text-white"
                : "bg-white text-gray-600 shadow-sm hover:bg-sky-100"
            }`}
          >
            {label}
          </Link>
        ))}
        <span className="text-gray-400">{total}件</span>
      </div>

      <AdminPostList
        rows={posts.map((post) => {
          const p = toJson(post);
          return { post: p, suggestions: suggestTagsFromText(p.text, entries) };
        })}
        students={students}
      />

      {total > 50 && (
        <nav className="mt-6 flex justify-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/admin?filter=${filter}&page=${page - 1}`}
              className="rounded-full bg-white px-4 py-2 shadow-sm"
            >
              ← 前へ
            </Link>
          )}
          {page * 50 < total && (
            <Link
              href={`/admin?filter=${filter}&page=${page + 1}`}
              className="rounded-full bg-white px-4 py-2 shadow-sm"
            >
              次へ →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
