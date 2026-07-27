"use client";

import { type ReactNode, useEffect, useState } from "react";

type Item = { key: string | number; node: ReactNode };

// CSS columns(段組み)は「1列目の上→下、次に2列目…」と縦に流れるため、
// 新着順リストでも古い投稿が上段(右の列の先頭)に見えてしまう。
// マウント後はビューポート幅から列数を決め、行優先(左→右)で振り分けて
// 「新しいものが上の行に並ぶ」見た目にする。
export default function Masonry({ items }: { items: Item[] }) {
  const [cols, setCols] = useState(0);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    const update = () => setCols(lg.matches ? 3 : sm.matches ? 2 : 1);
    update();
    lg.addEventListener("change", update);
    sm.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      sm.removeEventListener("change", update);
    };
  }, []);

  // マウント前(SSR直後)は従来の段組みで描画し、マウント後に行優先へ切り替える
  if (cols === 0) {
    return (
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((it) => (
          <div key={it.key} className="break-inside-avoid">
            {it.node}
          </div>
        ))}
      </div>
    );
  }

  const buckets: Item[][] = Array.from({ length: cols }, () => []);
  items.forEach((it, i) => buckets[i % cols].push(it));

  return (
    <div className="flex items-start gap-4">
      {buckets.map((bucket, c) => (
        <div key={c} className="min-w-0 flex-1">
          {bucket.map((it) => (
            <div key={it.key}>{it.node}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
