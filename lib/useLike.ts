"use client";

// いいねの状態をコンポーネント間で共有するためのフック。
// 同じ投稿がカードとライトボックスの両方に出るので、片方で押したら
// もう片方にも即座に反映されるよう、モジュール内の小さなストアで同期する。
import { useCallback, useEffect, useState } from "react";
import { getClientId, likedPosts } from "./clientStore";

type LikeState = { liked: boolean; count: number };

const store = new Map<number, LikeState>();
const listeners = new Map<number, Set<() => void>>();

function write(postId: number, next: LikeState) {
  store.set(postId, next);
  listeners.get(postId)?.forEach((fn) => fn());
}

export function useLike(postId: number, initialCount: number) {
  const [state, setState] = useState<LikeState>({ liked: false, count: initialCount });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // localStorage参照はマウント後に行う（SSRとの不一致を避けるため）
    if (!store.has(postId)) {
      store.set(postId, { liked: likedPosts.has(postId), count: initialCount });
    }
    const sync = () => setState(store.get(postId)!);
    sync();

    let set = listeners.get(postId);
    if (!set) {
      set = new Set();
      listeners.set(postId, set);
    }
    set.add(sync);
    return () => {
      set!.delete(sync);
      if (set!.size === 0) listeners.delete(postId);
    };
  }, [postId, initialCount]);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const before = store.get(postId) ?? { liked: false, count: initialCount };
    const next = !before.liked;
    // 先に見た目を変えて、失敗したら戻す
    write(postId, { liked: next, count: before.count + (next ? 1 : -1) });
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, clientId: getClientId() }),
      });
      if (res.ok) {
        const data = await res.json();
        write(postId, { liked: data.liked, count: data.count });
        likedPosts.toggle(postId, data.liked);
      } else {
        write(postId, before);
      }
    } catch {
      write(postId, before);
    } finally {
      setBusy(false);
    }
  }, [postId, initialCount, busy]);

  return { liked: state.liked, count: state.count, busy, toggle };
}
