"use client";

import { useEffect, useState } from "react";
import type { PostJson } from "@/lib/db";
import TagSuggestInput, { type StudentOption } from "./TagSuggestInput";

const MODE_LABEL: Record<string, string> = {
  all: "健全版",
  sensitive: "きわどい版",
  r18: "R18版",
};

export default function AdminPostRow({
  post,
  students,
  suggestions,
  selected,
  onToggleSelect,
  onSelectAuthor,
}: {
  post: PostJson;
  students: StudentOption[];
  suggestions: string[];
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
  onSelectAuthor?: (screenName: string) => void;
}) {
  const [tags, setTags] = useState<string[]>(post.tags);
  const [savedTags, setSavedTags] = useState<string[]>(post.tags);
  const [rating, setRating] = useState(post.rating);
  const [autoFlag, setAutoFlag] = useState(post.auto_tagged === 1);
  const [related, setRelated] = useState<{ name: string; count: number }[]>([]);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(false);

  async function call(action: string, extra: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, postId: post.id, ...extra }),
      });
      return res.ok;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (await call("setTags", { tags })) {
      setSavedTags(tags);
      setAutoFlag(false); // 手動保存＝確認済み
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  function addTag(name: string) {
    if (!tags.includes(name)) setTags((prev) => [...prev, name]);
  }

  // 付いているタグを元に「過去によくセットで付いているタグ」を引く
  const tagKey = tags.join(",");
  useEffect(() => {
    if (tags.length === 0) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "coTags", tags }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setRelated(d.tags ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagKey]);

  async function changeRating(next: string) {
    if (next === rating) return;
    if (await call("setRating", { rating: next })) setRating(next);
  }

  async function remove() {
    if (!confirm(`@${post.screen_name} の投稿を削除しますか？`)) return;
    if (await call("deletePost", {})) setDeleted(true);
  }

  if (deleted) return null;

  const isDead = post.status !== "approved";
  // 自動タグのままの投稿は管理人が確認するまで非公開
  const isPublic = !isDead && savedTags.length > 0 && !autoFlag;
  const dirty =
    tags.length !== savedTags.length || tags.some((t) => !savedTags.includes(t));
  const unusedSuggestions = suggestions.filter((s) => !tags.includes(s));
  // 本文からの候補と重複させない
  const unusedRelated = related.filter(
    (r) => !tags.includes(r.name) && !unusedSuggestions.includes(r.name)
  );

  const edge = isPublic
    ? "border-l-emerald-500"
    : isDead
      ? "border-l-red-400"
      : autoFlag
        ? "border-l-violet-400"
        : "border-l-amber-400";

  return (
    <div
      className={`rounded-xl border border-l-4 border-gray-200 bg-white p-3 text-sm ${edge} ${
        selected ? "ring-2 ring-sky-400" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect(post.id)}
            className="h-4 w-4 shrink-0 accent-sky-500"
            aria-label="この投稿を選択"
          />
        )}
        {/* 公開状態バッジ（一目でわかるように先頭・固定幅） */}
        <div className="w-40 shrink-0">
          {isPublic ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              公開中・{MODE_LABEL[rating] ?? rating}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
              <span
                className={`h-2 w-2 rounded-full ${
                  isDead ? "bg-red-500" : autoFlag ? "bg-violet-500" : "bg-amber-500"
                }`}
                aria-hidden="true"
              />
              非公開（{isDead ? "ツイート消滅" : autoFlag ? "自動タグ未確認" : "タグ未設定"}）
            </span>
          )}
          {autoFlag && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
              確認待ち（保存で公開）
            </span>
          )}
        </div>

        {post.photos[0] && (
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="flex-none cursor-zoom-in rounded-lg"
            title="クリックで拡大"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.photos[0].url}
              alt=""
              referrerPolicy="no-referrer"
              loading="lazy"
              className="h-28 w-28 rounded-lg object-cover ring-1 ring-gray-200 transition hover:ring-2 hover:ring-sky-400"
            />
            {post.photos.length > 1 && (
              <span className="mt-0.5 block text-center text-[10px] text-gray-400">
                他{post.photos.length - 1}枚
              </span>
            )}
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-600 hover:underline"
            >
              {post.author_name} @{post.screen_name}
            </a>
            {onSelectAuthor && (
              <button
                type="button"
                onClick={() => onSelectAuthor(post.screen_name)}
                className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] text-sky-600 hover:bg-sky-100"
                title="この作者の投稿をまとめて選択"
              >
                この作者を選択
              </button>
            )}
          </div>
          <p className="truncate text-gray-500">{post.text || "(本文なし)"}</p>
        </div>
        <div
          className="inline-flex overflow-hidden rounded-lg border border-gray-300 text-xs"
          role="group"
          aria-label="掲載先モード（クリックで即変更）"
        >
          {(
            [
              ["all", "健全", "bg-sky-500"],
              ["sensitive", "きわどい", "bg-amber-500"],
              ["r18", "R18", "bg-rose-600"],
            ] as const
          ).map(([key, label, activeCls]) => (
            <button
              key={key}
              onClick={() => changeRating(key)}
              disabled={busy}
              aria-pressed={rating === key}
              className={`px-2.5 py-1.5 font-semibold disabled:opacity-50 ${
                rating === key ? `${activeCls} text-white` : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={remove}
          disabled={busy}
          className="rounded-lg bg-red-100 px-3 py-1.5 text-red-600 hover:bg-red-200 disabled:opacity-50"
        >
          削除
        </button>
      </div>

      {/* タグ編集行 */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-gray-50 p-2">
        <span className="text-xs font-bold text-gray-500">現在のタグ:</span>
        {tags.length === 0 ? (
          <span className="text-xs text-gray-400">なし（付けるまで非公開）</span>
        ) : (
          tags.map((t) => (
            <button
              key={t}
              onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
              className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
              title="クリックで外す"
            >
              {t} ✕
            </button>
          ))
        )}

        {unusedSuggestions.length > 0 && (
          <>
            <span className="ml-2 text-xs text-gray-400">候補:</span>
            {unusedSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => addTag(s)}
                className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                title="本文から検出した候補。クリックで追加"
              >
                +{s}
              </button>
            ))}
          </>
        )}

        {unusedRelated.length > 0 && (
          <>
            <span className="ml-2 text-xs text-gray-400">よく一緒に:</span>
            {unusedRelated.map((r) => (
              <button
                key={r.name}
                onClick={() => addTag(r.name)}
                className="rounded-full border border-violet-300 bg-white px-3 py-1 text-xs text-violet-700 hover:bg-violet-50"
                title={`過去に${r.count}件で一緒に付けられています。クリックで追加`}
              >
                +{r.name}
                <span className="ml-1 text-[10px] text-violet-400">{r.count}</span>
              </button>
            ))}
          </>
        )}

        <div className="w-48">
          <TagSuggestInput
            students={students}
            exclude={tags}
            onSelect={addTag}
            placeholder="タグ追加（ひらがな可）"
            compact
          />
        </div>
        <button
          onClick={save}
          disabled={busy || (!dirty && !autoFlag && !saved)}
          className={`rounded-lg px-4 py-1.5 font-semibold text-white disabled:opacity-40 ${
            dirty
              ? "animate-pulse bg-orange-500 hover:bg-orange-600"
              : autoFlag
                ? "bg-violet-600 hover:bg-violet-700"
                : "bg-sky-500"
          }`}
        >
          {saved ? "保存✓" : dirty ? "保存する（未保存）" : autoFlag ? "確認して公開" : "保存"}
        </button>
      </div>

      {zoom && post.photos[0] && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
          aria-label="画像拡大"
        >
          <div className="flex max-h-[85vh] flex-wrap items-center justify-center gap-2 overflow-auto">
            {post.photos.map((ph, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={ph.url}
                alt=""
                referrerPolicy="no-referrer"
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>
          <p className="text-xs text-white/70">クリックで閉じる</p>
        </div>
      )}
    </div>
  );
}
