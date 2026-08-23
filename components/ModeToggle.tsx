"use client";

import { useState } from "react";
import type { Rating } from "@/lib/db";
import Portal from "./Portal";

const CONFIRM: Record<Exclude<Rating, "all">, { title: string; body: string; yes: string; color: string }> = {
  sensitive: {
    title: "表示確認",
    body: "きわどい版には水着・下着などのセンシティブな表現が含まれます。表示しますか？",
    yes: "表示する",
    color: "bg-amber-500 hover:bg-amber-600",
  },
  r18: {
    title: "年齢確認",
    body: "R18版には成人向けの内容が含まれます。あなたは18歳以上ですか？",
    yes: "はい、18歳以上です",
    color: "bg-rose-600 hover:bg-rose-700",
  },
};

export default function ModeToggle({ mode }: { mode: Rating }) {
  const [confirming, setConfirming] = useState<"sensitive" | "r18" | null>(null);
  const [busy, setBusy] = useState(false);

  async function setMode(next: Rating) {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: next }),
      });
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  function onClick(next: Rating) {
    if (next === mode) return;
    if (next === "all") setMode("all");
    else setConfirming(next);
  }

  const btn = (key: Rating, label: string, activeCls: string, hoverCls: string) => (
    <button
      onClick={() => onClick(key)}
      aria-pressed={mode === key}
      /* スマホはロゴと同じ行に収めるため詰める */
      className={`px-1.5 py-1.5 font-semibold sm:px-3 ${
        mode === key ? `${activeCls} text-white` : `bg-white text-gray-500 ${hoverCls}`
      }`}
    >
      {label}
    </button>
  );

  const c = confirming ? CONFIRM[confirming] : null;

  return (
    <>
      <div
        className="flex items-center overflow-hidden rounded-full border border-gray-300 text-[11px] sm:text-xs"
        role="group"
        aria-label="健全版・きわどい版・R18版の切り替え"
      >
        {btn("all", "健全", "bg-sky-500", "hover:bg-sky-50")}
        {btn("sensitive", "きわどい", "bg-amber-500", "hover:bg-amber-50")}
        {btn("r18", "R18", "bg-rose-600", "hover:bg-rose-50")}
      </div>

      {c && (
        <Portal>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={c.title}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="mb-1 text-lg font-bold text-gray-800">{c.title}</p>
            <p className="mb-5 text-sm text-gray-600">{c.body}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => confirming && setMode(confirming)}
                disabled={busy}
                className={`rounded-full px-6 py-2 text-sm font-semibold text-white disabled:opacity-50 ${c.color}`}
              >
                {c.yes}
              </button>
              <button
                onClick={() => setConfirming(null)}
                className="rounded-full bg-gray-100 px-6 py-2 text-sm text-gray-600 hover:bg-gray-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}
