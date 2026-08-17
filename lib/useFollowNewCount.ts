"use client";

// フォロー中の生徒の新着件数。ヘッダーのベル(PC)とメニューボタンのバッジ(スマホ)で
// 同じ数字を使うため共通化している。
import { useEffect, useState } from "react";
import { follows, followLastSeen } from "./clientStore";

export function useFollowNewCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const names = follows.get();
    if (names.length === 0) return;
    const since = followLastSeen.get() || Math.floor(Date.now() / 1000) - 7 * 86400;
    let cancelled = false;
    fetch(`/api/posts?tags=${encodeURIComponent(names.join(","))}&sinceCount=${since}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setCount(d.count ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}
