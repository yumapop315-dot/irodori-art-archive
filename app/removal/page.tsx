"use client";

import { useState } from "react";

export default function RemovalPage() {
  const [url, setUrl] = useState("");
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/removal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, reason, contact }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "送信に失敗しました");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("送信に失敗しました。時間をおいて再度お試しください");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="mb-2 text-lg font-bold">削除依頼を受け付けました</p>
        <p className="text-sm text-gray-500">
          確認のうえ、速やかに対応いたします。ご連絡ありがとうございました。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="ba-heading mb-1 text-xl">掲載停止（削除依頼）</h1>
      <p className="mb-6 text-sm text-gray-500">
        ご自身の投稿の掲載停止を希望される方は、以下のフォームからご連絡ください。
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="rm-url" className="mb-1 block text-sm font-semibold">
            対象の投稿URL <span className="text-red-500">*</span>
          </label>
          <input
            id="rm-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://x.com/... または本サイトのページURL"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="rm-reason" className="mb-1 block text-sm font-semibold">
            ご依頼内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rm-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder="例: 投稿者本人です。この投稿の掲載を停止してください。"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="rm-contact" className="mb-1 block text-sm font-semibold">
            ご連絡先（任意）
          </label>
          <input
            id="rm-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="XのID・メールアドレスなど（返信が必要な場合）"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={state === "busy"}
          className="w-full rounded-lg bg-sky-500 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
        >
          {state === "busy" ? "送信中..." : "送信する"}
        </button>
      </form>
    </div>
  );
}
