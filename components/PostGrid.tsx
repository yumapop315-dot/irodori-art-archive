"use client";

// ランキング等の固定リスト表示用グリッド（順位バッジ・ライトボックス・ミュート対応）
import { type ReactNode, useEffect, useState } from "react";
import type { PostJson } from "@/lib/db";
import { mutes } from "@/lib/clientStore";
import PostCard from "./PostCard";
import AdSlot from "./AdSlot";
import Masonry from "./Masonry";
import { Lightbox } from "./Feed";

const RANK_COLORS = [
  "bg-yellow-400 text-yellow-950", // 1位
  "bg-gray-300 text-gray-700", // 2位
  "bg-amber-600 text-amber-50", // 3位
];

export default function PostGrid({
  posts,
  ranked = false,
  showAds = false,
  promo,
  emptyMessage = "まだ表示できる投稿がありません。",
}: {
  posts: PostJson[];
  ranked?: boolean;
  showAds?: boolean;
  /** 広告の代わりに差し込む枠（成人向けモードのDLsite導線用） */
  promo?: ReactNode;
  emptyMessage?: string;
}) {
  const [mutedList, setMutedList] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<{ post: PostJson; index: number } | null>(null);

  useEffect(() => setMutedList(mutes.get()), []);

  const visible = posts.filter((p) => !mutedList.includes(p.screen_name));

  if (visible.length === 0) {
    return <p className="py-16 text-center text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <>
      <Masonry
        items={visible.map((post, i) => ({
          key: post.id,
          node: (
            <div className="relative mb-4 [&>article]:mb-0">
              {ranked && (
                <span
                  className={`absolute -left-1.5 -top-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold shadow ${
                    RANK_COLORS[i] ?? "bg-white text-gray-500"
                  }`}
                  aria-label={`${i + 1}位`}
                >
                  {i + 1}
                </span>
              )}
              <PostCard
                post={post}
                onOpenImage={(p, idx) => setLightbox({ post: p, index: idx })}
                onMuted={() => setMutedList(mutes.get())}
              />
              {/* 8件目の後、以降12件ごとにインフィード広告 */}
              {(showAds || promo) && (i === 7 || (i > 7 && (i - 7) % 12 === 0)) && (
                <div className="mt-4">{showAds ? <AdSlot variant="infeed" /> : promo}</div>
              )}
            </div>
          ),
        }))}
      />

      {lightbox && (
        <Lightbox
          post={lightbox.post}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={(i) => setLightbox({ ...lightbox, index: i })}
        />
      )}
    </>
  );
}
