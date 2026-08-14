"use client";

// 管理人の一言（サイト最上部・バナー直下に出るお知らせ）の編集欄。
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NoticeEditor({
  initial,
  max,
}: {
  initial: string;
  max: number;
}) {
  const router = useRouter();
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const dirty = text !== saved;

  async function save(next: string) {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setNotice", text: next }),
      });
      if (res.ok) {
        const data = await res.json();
        // 前後の空白除去・文字数制限はサーバー側で行うので、保存後の値を正とする
        const stored = typeof data.text === "string" ? data.text : next;
        setText(stored);
        setSaved(stored);
        setMsg(stored ? "保存しました（サイト上部に表示中）" : "一言欄を非表示にしました");
        router.refresh();
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("保存に失敗しました");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-gray-700">
          管理人の一言
          <span className="ml-2 font-normal text-gray-400">
            サイト最上部（バナーの下）に全ページ共通で表示
          </span>
        </h2>
        <span className="text-xs text-gray-400">
          {text.length}/{max}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={max}
        placeholder="例: 新しいキャラのタグを追加しました。抜けているタグがあればお問い合わせから教えてください。"
        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-sky-400 focus:outline-none"
      />

      {/* 保存済みの内容が今どう出ているかのプレビュー */}
      {saved && (
        <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">
          <span className="font-bold">表示中: </span>
          <span className="whitespace-pre-wrap">{saved}</span>
        </p>
      )}

      <p className="mt-1 text-xs text-gray-400">
        空にして保存すると欄ごと消えます。装飾やリンクは使えず、書いた文字がそのまま表示されます。
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => save(text)}
          disabled={busy || !dirty}
          className={`rounded-lg px-5 py-1.5 text-sm font-semibold text-white disabled:opacity-40 ${
            dirty ? "animate-pulse bg-orange-500 hover:bg-orange-600" : "bg-sky-500"
          }`}
        >
          {busy ? "保存中..." : dirty ? "保存する（未保存）" : "保存"}
        </button>
        <button
          onClick={() => save("")}
          disabled={busy || (!saved && !text)}
          className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-40"
        >
          消す
        </button>
        {msg && <span className="text-xs text-emerald-600">{msg}</span>}
      </div>
    </section>
  );
}
