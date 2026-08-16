"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Photo } from "@/lib/db";
import TagSuggestInput, { type StudentOption } from "./TagSuggestInput";

type PreviewData = {
  tweet: {
    authorName: string;
    screenName: string;
    text: string;
    photos: Photo[];
  };
  suggestedTags: string[];
};

export default function RegisterForm({ students }: { students: StudentOption[] }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  return (
    <div>
      <div className="mb-4 flex gap-2 text-sm">
        <button
          onClick={() => setMode("single")}
          aria-pressed={mode === "single"}
          className={`rounded-full px-4 py-1.5 ${mode === "single" ? "bg-sky-500 font-semibold text-white" : "bg-white text-gray-600 shadow-sm"}`}
        >
          1件ずつ登録
        </button>
        <button
          onClick={() => setMode("bulk")}
          aria-pressed={mode === "bulk"}
          className={`rounded-full px-4 py-1.5 ${mode === "bulk" ? "bg-sky-500 font-semibold text-white" : "bg-white text-gray-600 shadow-sm"}`}
        >
          まとめて登録
        </button>
      </div>
      {mode === "single" ? <SingleForm students={students} /> : <BulkForm />}
    </div>
  );
}

function SingleForm({ students }: { students: StudentOption[] }) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "busy" | "done">("idle");
  const [autoTagged, setAutoTagged] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL入力から自動プレビュー（600msデバウンス）
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setPreview(null);
    setError("");
    if (!/(?:twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/\d+/.test(url)) return;
    timer.current = setTimeout(async () => {
      setState("loading");
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "取得に失敗しました");
          return;
        }
        setPreview(data);
        setSelected(data.suggestedTags ?? []);
      } finally {
        setState("idle");
      }
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [url]);

  function addTag(name: string) {
    const t = name.trim();
    if (t && !selected.includes(t)) setSelected((prev) => [...prev, t]);
  }

  async function submit() {
    if (state === "busy") return;
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, tags: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました");
        setState("idle");
        return;
      }
      setAutoTagged(Array.isArray(data.autoTagged) ? data.autoTagged : []);
      setState("done");
    } catch {
      setError("登録に失敗しました");
      setState("idle");
    }
  }

  function reset() {
    setUrl("");
    setPreview(null);
    setSelected([]);
    setError("");
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="mb-1 text-lg font-bold text-emerald-700">登録しました！</p>
        <p className="mb-6 text-sm text-emerald-600">
          ご協力ありがとうございます。
          {selected.length === 0 && autoTagged.length > 0 && (
            <>
              <br />
              本文から「{autoTagged.join("・")}」を自動でタグ付けしました。
              管理人が確認した後に一覧へ表示されます。
            </>
          )}
          {selected.length === 0 && autoTagged.length === 0 && (
            <>
              <br />
              タグ未設定のため、管理人がキャラ名タグを付けた後に一覧へ表示されます。
            </>
          )}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            続けて登録する
          </button>
          <Link
            href="/?sort=new"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-sky-600 shadow-sm hover:bg-sky-50"
          >
            トップで見る
          </Link>
        </div>
      </div>
    );
  }

  const photo = preview?.tweet.photos[0];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="reg-url" className="mb-1 block text-sm font-semibold">
          Step 1: X投稿のURLを貼り付け（自動でプレビューされます）
        </label>
        <input
          id="reg-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://x.com/ユーザー名/status/..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-sky-400 sm:text-sm focus:outline-none"
        />
      </div>

      {state === "loading" && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" aria-hidden="true" />
          投稿を取得中...
        </div>
      )}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {preview && (
        <>
          <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
            {photo && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photo.url}
                alt="プレビュー"
                referrerPolicy="no-referrer"
                className="h-24 w-24 flex-none rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {preview.tweet.authorName}{" "}
                <span className="font-normal text-gray-500">@{preview.tweet.screenName}</span>
              </p>
              <p className="mt-1 text-xs text-gray-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden whitespace-pre-line">
                {preview.tweet.text || "(本文なし)"}
              </p>
              <p className="mt-1 text-xs text-gray-400">画像 {preview.tweet.photos.length}枚</p>
            </div>
          </div>

          <div>
            <label htmlFor="reg-tag" className="mb-1 block text-sm font-semibold">
              Step 2: キャラ名タグ
              {preview.suggestedTags.length > 0 && (
                <span className="ml-2 text-xs font-normal text-emerald-600">
                  本文から自動で候補を入れました。違っていたら✕で外してください
                </span>
              )}
            </label>
            <TagSuggestInput
              id="reg-tag"
              students={students}
              exclude={selected}
              onSelect={addTag}
              placeholder="キャラ名を入力（ひらがなでもOK）→ 候補をクリック"
            />
            {selected.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelected((prev) => prev.filter((x) => x !== t))}
                    className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700 hover:bg-red-100 hover:text-red-600"
                    title="クリックで削除"
                  >
                    {t} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={submit}
            disabled={state === "busy"}
            className="ba-btn w-full py-3 disabled:opacity-50"
          >
            <span>{state === "busy" ? "登録中..." : "Step 3: この投稿を登録する"}</span>
          </button>
        </>
      )}
    </div>
  );
}

const BULK_MAX = 1000;
const CHUNK = 20;

type BulkResult = { url: string; ok: boolean; error?: string };

function BulkForm() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<BulkResult[] | null>(null);

  // 入力URLの行数（上限超過の注意表示用）
  const lineCount = text.split(/\n+/).map((s) => s.trim()).filter(Boolean).length;

  async function submit() {
    const urls = text
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, BULK_MAX);
    if (urls.length === 0 || busy) return;
    setBusy(true);
    setResults(null);
    setProgress({ done: 0, total: urls.length });

    const acc: BulkResult[] = [];
    try {
      // 20件ずつに分割して順次送信（1リクエストが長くなりすぎないように）
      for (let i = 0; i < urls.length; i += CHUNK) {
        const chunk = urls.slice(i, i + CHUNK);
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: chunk, tags: [] }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          // レート制限等でチャンクごと失敗した場合は、その分をエラーとして記録して中断
          chunk.forEach((url) => acc.push({ url, ok: false, error: data?.error ?? "登録に失敗しました" }));
          setResults([...acc]);
          setProgress({ done: acc.length, total: urls.length });
          break;
        }
        const data = await res.json();
        acc.push(...(data.results as BulkResult[]));
        setResults([...acc]);
        setProgress({ done: acc.length, total: urls.length });
      }
    } finally {
      setBusy(false);
    }
  }

  const okCount = results?.filter((r) => r.ok).length ?? 0;
  const ngCount = results ? results.length - okCount : 0;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="bulk-urls" className="mb-1 block text-sm font-semibold">
          X投稿のURLを1行に1件ずつ（最大{BULK_MAX}件）
        </label>
        <p className="mb-2 text-xs text-gray-500">
          キャラ名タグは登録後に管理人が付与します。タグが付くまで一覧には表示されません。
          件数が多いと数分かかります。処理中はこのページを閉じないでください。
        </p>
        <textarea
          id="bulk-urls"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          disabled={busy}
          placeholder={"https://x.com/.../status/...\nhttps://x.com/.../status/..."}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-sky-400 sm:text-sm focus:outline-none disabled:bg-gray-50"
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className={lineCount > BULK_MAX ? "font-bold text-red-500" : "text-gray-400"}>
            {lineCount}件入力中
            {lineCount > BULK_MAX && `（上限${BULK_MAX}件を超えた分は無視されます）`}
          </span>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={busy || lineCount === 0}
        className="w-full rounded-lg bg-sky-500 py-3 font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
      >
        <span>
          {busy && progress
            ? `登録中... ${progress.done} / ${progress.total}`
            : `まとめて登録する（${Math.min(lineCount, BULK_MAX)}件）`}
        </span>
      </button>

      {progress && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
          />
        </div>
      )}

      {results && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            <span className="text-emerald-600">成功 {okCount}件</span>
            {ngCount > 0 && <span className="ml-3 text-red-500">失敗 {ngCount}件</span>}
          </p>
          {ngCount > 0 && (
            <ul className="max-h-64 space-y-1.5 overflow-y-auto text-sm">
              {results
                .filter((r) => !r.ok)
                .map((r, i) => (
                  <li key={i} className="rounded-lg bg-red-50 px-3 py-2 text-red-600">
                    ✕ {r.error}
                    {r.url && <span className="ml-2 break-all text-xs opacity-70">{r.url}</span>}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
