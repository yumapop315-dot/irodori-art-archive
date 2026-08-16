"use client";

// 画面右下に出る「ページ上部へ戻る」ボタン。少しスクロールしてから現れる。
import { useEffect, useState } from "react";
import type { Rating } from "@/lib/db";

const COLOR: Record<Rating, string> = {
  all: "bg-[var(--ba-blue)] hover:bg-[var(--ba-blue-deep)]",
  sensitive: "bg-amber-500 hover:bg-amber-600",
  r18: "bg-rose-600 hover:bg-rose-700",
};

export default function ScrollTopButton({ mode }: { mode: Rating }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll(); // 再読み込みで途中位置から始まった場合にも対応
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="ページ上部へ戻る"
      title="ページ上部へ戻る"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/70 transition duration-200 ${
        COLOR[mode]
      } ${visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
