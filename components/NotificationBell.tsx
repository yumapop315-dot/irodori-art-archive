"use client";

// PC専用。スマホではヘッダーを1行に収めるため出さず、
// 代わりにメニューボタン(MobileMenu)にバッジを出している。
import Link from "next/link";
import { useFollowNewCount } from "@/lib/useFollowNewCount";

export default function NotificationBell() {
  const count = useFollowNewCount();

  return (
    <Link
      href="/following"
      className="relative hidden rounded-full p-2 text-gray-500 hover:bg-sky-50 sm:block"
      aria-label={count > 0 ? `フォロー中の新着${count}件` : "フォロー中の生徒"}
      title="フォロー中の生徒"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
