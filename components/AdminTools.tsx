"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "logout" }),
        });
        router.refresh();
      }}
      className="rounded-full bg-gray-100 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-200"
    >
      ログアウト
    </button>
  );
}

export function CheckDeadButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function run() {
    setBusy(true);
    setResult("");
    try {
      let offset = 0;
      let totalChecked = 0;
      let totalDead = 0;
      // 30件ずつ最大5バッチ（計150件）
      for (let i = 0; i < 5; i++) {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "checkDead", offset }),
        });
        if (!res.ok) break;
        const data = await res.json();
        totalChecked += data.checked;
        totalDead += data.dead;
        if (data.checked < 30) break;
        offset += 30 - data.dead;
      }
      setResult(`${totalChecked}件チェック、${totalDead}件を非表示にしました`);
      if (totalDead > 0) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        onClick={run}
        disabled={busy}
        className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200 disabled:opacity-50"
      >
        {busy ? "チェック中..." : "消えたツイートをチェック"}
      </button>
      {result && <span className="text-xs text-gray-500">{result}</span>}
    </span>
  );
}

export function RemovalRow({
  req,
}: {
  req: { id: number; url: string; reason: string; contact: string; created_at: number; resolved: number };
}) {
  const [resolved, setResolved] = useState(req.resolved === 1);
  return (
    <div className={`rounded-xl border p-3 text-sm ${resolved ? "border-gray-200 bg-gray-50 opacity-60" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a href={req.url} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-sky-600 hover:underline">
          {req.url}
        </a>
        {!resolved && (
          <button
            onClick={async () => {
              const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "resolveRemoval", id: req.id }),
              });
              if (res.ok) setResolved(true);
            }}
            className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
          >
            対応済みにする
          </button>
        )}
      </div>
      <p className="mt-1 whitespace-pre-line text-gray-700">{req.reason}</p>
      {req.contact && <p className="mt-1 text-xs text-gray-500">連絡先: {req.contact}</p>}
      <p className="mt-1 text-xs text-gray-400">
        {new Date(req.created_at * 1000).toLocaleString("ja-JP")}
      </p>
    </div>
  );
}
