"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostJson } from "@/lib/db";
import { mutes } from "@/lib/clientStore";
import { useLike } from "@/lib/useLike";
import { artistPath, tagPath } from "@/lib/paths";
import PostCardAdminTools from "./PostCardAdminTools";

function fmtDate(unix: number): string {
  const d = new Date(unix * 1000);
  const h = d.getHours();
  const ampm = h < 12 ? "午前" : "午後";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm}${h12}:${String(d.getMinutes()).padStart(2, "0")}・${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function PostCard({
  post,
  onOpenImage,
  onMuted,
  isAdmin = false,
  onRemoved,
}: {
  post: PostJson;
  onOpenImage: (post: PostJson, index: number) => void;
  onMuted: (screenName: string) => void;
  /** 管理人ログイン中はカード下部に編集・削除の操作欄を出す */
  isAdmin?: boolean;
  /** 削除された / タグが空になり非公開になった投稿を一覧から外すための通知 */
  onRemoved?: (postId: number) => void;
}) {
  const { liked, count, toggle: toggleLike } = useLike(post.id, post.like_count);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tags, setTags] = useState<string[]>(post.tags);

  const photo = post.photos[0];
  const aspect = photo && photo.width > 0 ? photo.width / photo.height : 1;

  return (
    <article className="ba-card mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-[#d5e5f5] bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 pt-3">
        <Link
          href={artistPath(post.screen_name)}
          className="min-w-0 flex-1 rounded-md hover:bg-sky-50"
          title={`${post.author_name}さんのイラスト一覧`}
        >
          <p className="truncate text-sm font-bold leading-tight">{post.author_name}</p>
          <p className="truncate text-xs text-gray-500">@{post.screen_name}</p>
        </Link>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-50"
        >
          Xで表示
        </a>
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full px-2 py-1 text-gray-400 hover:bg-gray-100"
            aria-label="メニュー"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  mutes.add(post.screen_name);
                  setMenuOpen(false);
                  onMuted(post.screen_name);
                }}
                className="block w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
              >
                @{post.screen_name} をミュート
              </button>
            </div>
          )}
        </div>
      </div>

      {post.text && (
        <p className="px-3 pt-2 text-sm leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden whitespace-pre-line">
          {post.text}
        </p>
      )}

      {photo && (
        <button
          onClick={() => onOpenImage(post, 0)}
          className="relative mt-2 block w-full cursor-zoom-in bg-gray-100"
          style={{ aspectRatio: `${aspect}` }}
          aria-label="画像を拡大"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={`${post.author_name}のイラスト`}
            referrerPolicy="no-referrer"
            loading="lazy"
            width={photo.width}
            height={photo.height}
            className="h-full w-full object-cover"
          />
          {post.photos.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
              +{post.photos.length - 1}
            </span>
          )}
        </button>
      )}

      <p className="px-3 pt-2 text-xs text-gray-400">{fmtDate(post.posted_at)}</p>

      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-3 pt-1.5">
        <button
          onClick={toggleLike}
          aria-pressed={liked}
          className={`flex min-h-11 items-center gap-1 rounded-full px-4 text-sm tabular-nums transition-colors ${
            liked
              ? "bg-pink-100 font-semibold text-pink-600"
              : "bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500"
          }`}
        >
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
          <span>{count}</span>
        </button>
        {tags.map((t) => (
          <Link
            key={t}
            href={tagPath(t)}
            className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700 hover:bg-sky-100"
          >
            {t}
          </Link>
        ))}
        {tags.length === 0 && <span className="text-xs text-gray-400">タグ確認中</span>}
      </div>

      {isAdmin && (
        <PostCardAdminTools
          postId={post.id}
          screenName={post.screen_name}
          tags={tags}
          onTagsSaved={(next) => {
            setTags(next);
            // タグが空＝公開条件を満たさないので一覧から外す
            if (next.length === 0) onRemoved?.(post.id);
          }}
          onDeleted={() => onRemoved?.(post.id)}
        />
      )}
    </article>
  );
}
