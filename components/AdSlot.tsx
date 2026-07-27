"use client";

// Google AdSense広告スロット。
// NEXT_PUBLIC_ADSENSE_CLIENT が未設定の間はプレースホルダーを表示する。
// ポリシー上、成人向けコンテンツには配信不可のため健全版でのみ使うこと。
import { useEffect, useRef } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // 例: ca-pub-1234567890123456

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const SLOTS = {
  infeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
  banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER,
};

export default function AdSlot({ variant = "infeed" }: { variant?: "infeed" | "banner" }) {
  const slot = SLOTS[variant];
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 広告ブロッカー等で失敗しても何もしない
    }
  }, [slot]);

  // 未設定時は何も表示しない（広告なし運用）。envを設定すると配信が始まる
  if (!CLIENT || !slot) return null;

  return (
    <div className={variant === "infeed" ? "min-h-52" : "min-h-24"}>
      <span className="mb-0.5 block text-right text-[10px] text-gray-400">スポンサーリンク</span>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
