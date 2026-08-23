"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PostJson } from "@/lib/db";
import { follows, likedPosts, mutes } from "@/lib/clientStore";
import { useLike } from "@/lib/useLike";
import { tagPath } from "@/lib/paths";
import PostCard from "./PostCard";
import AdSlot from "./AdSlot";
import Masonry from "./Masonry";

type Unresolved = { token: string; candidates: string[] };

type Source =
  | { kind: "search"; tags: string[]; sort: string; author?: string }
  | { kind: "following" }
  | { kind: "favorites" };

export default function Feed({
  source,
  initialPosts,
  initialTotal,
  initialUnresolved,
  showAds = false,
  isAdmin = false,
}: {
  source: Source;
  initialPosts?: PostJson[];
  initialTotal?: number;
  initialUnresolved?: Unresolved[];
  showAds?: boolean;
  /** 管理人ログイン中は各カードに編集・削除の操作欄を出す */
  isAdmin?: boolean;
}) {
  const [posts, setPosts] = useState<PostJson[]>(initialPosts ?? []);
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [unresolved, setUnresolved] = useState<Unresolved[]>(initialUnresolved ?? []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!initialPosts);
  const [done, setDone] = useState(false);
  const [mutedList, setMutedList] = useState<string[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [lightbox, setLightbox] = useState<{ post: PostJson; index: number } | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const followTags = useRef<string[]>([]);

  useEffect(() => setMutedList(mutes.get()), []);

  const buildUrl = useCallback(
    (p: number): string | null => {
      if (source.kind === "favorites") {
        const ids = likedPosts.get();
        return ids.length ? `/api/posts?ids=${ids.join(",")}` : null;
      }
      if (source.kind === "following") {
        if (followTags.current.length === 0) followTags.current = follows.get();
        const t = followTags.current;
        return t.length
          ? `/api/posts?tags=${encodeURIComponent(t.join(","))}&mode=or&sort=new&page=${p}`
          : null;
      }
      const q = new URLSearchParams();
      if (source.tags.length) q.set("tags", source.tags.join(","));
      if (source.author) q.set("author", source.author);
      q.set("sort", source.sort);
      q.set("page", String(p));
      return `/api/posts?${q.toString()}`;
    },
    [source]
  );

  const loadPage = useCallback(
    async (p: number, replace: boolean) => {
      const url = buildUrl(p);
      if (!url) {
        setPosts([]);
        setTotal(0);
        setLoading(false);
        setDone(true);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const list: PostJson[] = data.posts ?? [];
        setPosts((cur) => (replace ? list : [...cur, ...list]));
        setTotal(data.total ?? list.length);
        setUnresolved(data.unresolved ?? []);
        if (source.kind === "favorites" || list.length === 0) setDone(true);
        else {
          const loaded = (replace ? 0 : posts.length) + list.length;
          setDone(loaded >= (data.total ?? 0));
        }
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buildUrl, source.kind, posts.length]
  );

  // 初回（SSRで初期データがない場合）
  useEffect(() => {
    if (!initialPosts) loadPage(1, true);
    else setDone(initialPosts.length >= (initialTotal ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 無限スクロール
  useEffect(() => {
    if (done || source.kind === "favorites") return;
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const next = page + 1;
          setPage(next);
          loadPage(next, false);
        }
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [done, loading, page, loadPage, source.kind]);

  const visible = posts.filter(
    (p) => !mutedList.includes(p.screen_name) && !removed.includes(p.id)
  );
  const hiddenCount = posts.filter((p) => mutedList.includes(p.screen_name)).length;

  return (
    <div>
      {unresolved.length > 0 && (
        <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {unresolved.map((u) => (
            <div key={u.token}>
              <p>
                「{u.token}」に一致するキャラが見つかりませんでした。
                {u.candidates.length > 0 && " もしかして:"}
              </p>
              {u.candidates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {u.candidates.map((c) => (
                    <Link
                      key={c}
                      href={tagPath(c)}
                      className="rounded-full bg-white px-3 py-1 text-xs text-sky-700 shadow-sm hover:bg-sky-50"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hiddenCount > 0 && (
        <p className="mb-3 text-center text-xs text-gray-400">
          ミュート中の作者の投稿を{hiddenCount}件非表示にしています（
          <Link href="/mutes" className="text-sky-600 hover:underline">
            ミュートリスト
          </Link>
          ）
        </p>
      )}

      {visible.length === 0 && !loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          {source.kind === "favorites" && (
            <p>お気に入りはまだありません。気に入ったイラストの ♡ を押すとここに並びます。</p>
          )}
          {source.kind === "following" && (
            <p>
              フォロー中の生徒がいません。
              <Link href="/students" className="text-sky-600 hover:underline">
                キャラ一覧
              </Link>
              からフォローすると新着をまとめて見られます。
            </p>
          )}
          {source.kind === "search" && unresolved.length === 0 && (
            <p>イラストが見つかりませんでした。</p>
          )}
        </div>
      ) : (
        <Masonry
          items={visible.map((post, i) => ({
            key: post.id,
            node: (
              <>
                <PostCard
                  post={post}
                  onOpenImage={(p, idx) => setLightbox({ post: p, index: idx })}
                  onMuted={() => setMutedList(mutes.get())}
                  isAdmin={isAdmin}
                  onRemoved={(id) => setRemoved((prev) => [...prev, id])}
                />
                {/* 8件目の後、以降12件ごとにインフィード広告を挟む */}
                {showAds && (i === 7 || (i > 7 && (i - 7) % 12 === 0)) && (
                  <div className="mb-4">
                    <AdSlot variant="infeed" />
                  </div>
                )}
              </>
            ),
          }))}
        />
      )}

      {loading && (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-4 break-inside-avoid rounded-2xl border border-gray-200 bg-white p-3">
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-48 animate-pulse rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!done && source.kind !== "favorites" && <div ref={sentinel} className="h-1" />}
      {done && visible.length > 0 && (
        <p className="py-8 text-center text-xs text-gray-400">
          {total}件すべて表示しました
        </p>
      )}

      {lightbox && (
        <Lightbox
          post={lightbox.post}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={(i) => setLightbox({ ...lightbox, index: i })}
        />
      )}
    </div>
  );
}

// スワイプと判定する最小移動量(px)。これ未満は「タップ」扱いにする
const SWIPE_MIN = 50;

export function Lightbox({
  post,
  index,
  onClose,
  onNav,
}: {
  post: PostJson;
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  const { liked, count, toggle } = useLike(post.id, post.like_count);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const last = post.photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < post.photos.length - 1) onNav(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, post.photos.length, onClose, onNav]);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // 横移動が縦移動より大きいときだけページ送りにする（縦スワイプの誤爆防止）
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0 && index < last) onNav(index + 1);
    if (dx > 0 && index > 0) onNav(index - 1);
  }

  const photo = post.photos[index];
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="画像の拡大表示"
    >
      <div
        className="flex max-h-[78vh] w-full justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={`${post.author_name}のイラスト ${index + 1}枚目`}
          referrerPolicy="no-referrer"
          draggable={false}
          className="max-h-[78vh] max-w-full select-none rounded-lg object-contain"
        />
      </div>

      {post.photos.length > 1 && (
        <div
          className="mt-3 flex items-center gap-4 text-sm text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onNav(index - 1)}
            disabled={index === 0}
            aria-label="前の画像"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
          >
            ←
          </button>
          <span className="tabular-nums">
            {index + 1} / {post.photos.length}
          </span>
          <button
            onClick={() => onNav(index + 1)}
            disabled={index === last}
            aria-label="次の画像"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}

      <div
        className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={toggle}
          aria-pressed={liked}
          aria-label={liked ? "いいねを取り消す" : "いいねする"}
          className={`flex min-h-11 items-center gap-1.5 rounded-full px-5 tabular-nums transition-colors ${
            liked ? "bg-pink-500 font-semibold text-white" : "bg-white/15 hover:bg-white/25"
          }`}
        >
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
          <span>{count}</span>
        </button>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center rounded-full bg-sky-500 px-5 font-semibold"
        >
          Xで表示
        </a>
        <button
          onClick={onClose}
          className="flex min-h-11 items-center rounded-full bg-white/10 px-5"
        >
          閉じる
        </button>
      </div>

      {post.photos.length > 1 && (
        <p className="mt-2 text-xs text-white/50 sm:hidden">左右にスワイプでめくれます</p>
      )}
    </div>
  );
}
