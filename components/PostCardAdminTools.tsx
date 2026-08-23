"use client";

// 管理人がログインしているときだけカード下部に出る操作欄。
// タイムラインを見ながらそのままタグ修正・削除ができるようにするためのもの。
import { useEffect, useState } from "react";
import TagSuggestInput, { type StudentOption } from "./TagSuggestInput";

// 生徒マスタは全カードで共通なので、最初に開いた1回だけ取得して使い回す
let cache: StudentOption[] | null = null;
let inflight: Promise<StudentOption[]> | null = null;

function loadStudents(): Promise<StudentOption[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listStudents" }),
    })
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((d) => {
        cache = d.students ?? [];
        return cache!;
      })
      .catch(() => [])
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export default function PostCardAdminTools({
  postId,
  screenName,
  tags,
  onTagsSaved,
  onDeleted,
}: {
  postId: number;
  screenName: string;
  tags: string[];
  /** 保存後のタグ。空になった場合は公開条件を満たさなくなる */
  onTagsSaved: (next: string[]) => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(tags);
  const [students, setStudents] = useState<StudentOption[]>(cache ?? []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (editing && students.length === 0) loadStudents().then(setStudents);
  }, [editing, students.length]);

  // 外側でタグが変わったら下書きも合わせる
  useEffect(() => setDraft(tags), [tags]);

  const dirty =
    draft.length !== tags.length || draft.some((t) => !tags.includes(t));

  async function call(body: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setMsg(res.status === 401 ? "ログインが切れています" : "失敗しました");
        return false;
      }
      return true;
    } catch {
      setMsg("通信に失敗しました");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (
      draft.length === 0 &&
      !confirm("タグを空にすると、この投稿は一覧から非表示になります（削除ではありません）。よろしいですか？")
    ) {
      return;
    }
    if (await call({ action: "setTags", postId, tags: draft })) {
      onTagsSaved(draft);
      setEditing(false);
    }
  }

  async function remove() {
    if (!confirm(`@${screenName} の投稿を削除しますか？\nこの操作は元に戻せません。`)) return;
    if (await call({ action: "deletePost", postId })) onDeleted();
  }

  return (
    <div className="border-t border-dashed border-violet-200 bg-violet-50/60 px-3 py-2">
      {!editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
            管理
          </span>
          <button
            onClick={() => setEditing(true)}
            className="min-h-8 rounded-full border border-violet-300 bg-white px-3 text-xs font-semibold text-violet-700 hover:bg-violet-100"
          >
            タグ変更
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="min-h-8 rounded-full bg-red-100 px-3 text-xs font-semibold text-red-600 hover:bg-red-200 disabled:opacity-50"
          >
            削除
          </button>
          {msg && <span className="text-xs text-red-600">{msg}</span>}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-violet-700">タグ:</span>
            {draft.length === 0 ? (
              <span className="text-xs text-gray-400">なし（保存すると非表示になります）</span>
            ) : (
              draft.map((t) => (
                <button
                  key={t}
                  onClick={() => setDraft((prev) => prev.filter((x) => x !== t))}
                  className="rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500"
                  title="クリックで外す"
                >
                  {t} ✕
                </button>
              ))
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-40 flex-1">
              <TagSuggestInput
                students={students}
                exclude={draft}
                onSelect={(name) =>
                  setDraft((prev) => (prev.includes(name) ? prev : [...prev, name]))
                }
                placeholder="タグ追加（ひらがな可）"
                compact
              />
            </div>
            <button
              onClick={save}
              disabled={busy || !dirty}
              className={`min-h-8 rounded-full px-4 text-xs font-semibold text-white disabled:opacity-40 ${
                dirty ? "bg-orange-500 hover:bg-orange-600" : "bg-sky-500"
              }`}
            >
              {busy ? "保存中..." : "保存"}
            </button>
            <button
              onClick={() => {
                setDraft(tags);
                setEditing(false);
                setMsg("");
              }}
              className="min-h-8 rounded-full bg-gray-100 px-3 text-xs text-gray-600 hover:bg-gray-200"
            >
              やめる
            </button>
            {msg && <span className="text-xs text-red-600">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
