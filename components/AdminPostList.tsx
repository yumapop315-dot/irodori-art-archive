"use client";

// 管理画面の投稿リスト。複数選択＋一括タグ付与（案C）を担う。
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PostJson } from "@/lib/db";
import AdminPostRow from "./AdminPostRow";
import TagSuggestInput, { type StudentOption } from "./TagSuggestInput";

export type AdminRow = { post: PostJson; suggestions: string[] };

export default function AdminPostList({
  rows,
  students,
}: {
  rows: AdminRow[];
  students: StudentOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const idList = useMemo(() => rows.map((r) => r.post.id), [rows]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAuthor(screenName: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => {
        if (r.post.screen_name.toLowerCase() === screenName.toLowerCase()) next.add(r.post.id);
      });
      return next;
    });
  }

  const allSelected = selected.size > 0 && selected.size === idList.length;
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(idList));
  }

  function addBulkTag(name: string) {
    setBulkTags((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }

  async function applyBulk() {
    if (busy || selected.size === 0 || bulkTags.length === 0) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulkSetTags",
          postIds: [...selected],
          tags: bulkTags,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(`${data.count}件に「${bulkTags.join("・")}」を付与しました`);
        setSelected(new Set());
        setBulkTags([]);
        router.refresh();
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("付与に失敗しました");
      }
    } finally {
      setBusy(false);
    }
  }

  // 自動タグの内容が正しいとき、タグを変えずにまとめて公開する
  async function approveBulk() {
    if (busy || selected.size === 0) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkApprove", postIds: [...selected] }),
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(`${data.count}件を確認済みにして公開しました`);
        setSelected(new Set());
        setBulkTags([]);
        router.refresh();
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("公開に失敗しました");
      }
    } finally {
      setBusy(false);
    }
  }

  async function deleteBulk() {
    if (busy || selected.size === 0) return;
    if (!confirm(`選択した${selected.size}件を削除しますか？\nこの操作は元に戻せません。`)) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkDelete", postIds: [...selected] }),
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(`${data.count}件を削除しました`);
        setSelected(new Set());
        setBulkTags([]);
        router.refresh();
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("削除に失敗しました");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-3 text-sm">
        <label className="flex items-center gap-1.5 text-gray-600">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 accent-sky-500"
          />
          全て選択
        </label>
        {selected.size > 0 && (
          <span className="text-gray-500">{selected.size}件選択中</span>
        )}
      </div>

      <div className="space-y-3 pb-24">
        {rows.map(({ post, suggestions }) => (
          <AdminPostRow
            key={post.id}
            post={post}
            students={students}
            suggestions={suggestions}
            selected={selected.has(post.id)}
            onToggleSelect={toggle}
            onSelectAuthor={selectAuthor}
          />
        ))}
      </div>

      {/* 一括操作バー（選択があるときだけ画面下部に固定表示） */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
            <span className="text-sm font-bold text-sky-700">{selected.size}件に一括タグ付け:</span>
            {bulkTags.map((t) => (
              <button
                key={t}
                onClick={() => setBulkTags((prev) => prev.filter((x) => x !== t))}
                className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
                title="クリックで外す"
              >
                {t} ✕
              </button>
            ))}
            <div className="w-48">
              <TagSuggestInput
                students={students}
                exclude={bulkTags}
                onSelect={addBulkTag}
                placeholder="タグを選ぶ（ひらがな可）"
                compact
              />
            </div>
            <button
              onClick={applyBulk}
              disabled={busy || bulkTags.length === 0}
              className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-40"
            >
              {busy ? "処理中..." : "付与して公開"}
            </button>
            <button
              onClick={approveBulk}
              disabled={busy}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
              title="自動タグのまま確認済みにして公開します（タグは変更しません）"
            >
              確認して公開
            </button>
            <button
              onClick={deleteBulk}
              disabled={busy}
              className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200 disabled:opacity-40"
            >
              選択を削除
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
            >
              選択解除
            </button>
            {msg && <span className="text-xs text-emerald-600">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
