"use client";

// 人気タグ。スマホではファーストビューを作品に譲るため既定で折りたたむ。
// PC(sm以上)では従来どおり常に開いた状態で出す。
import { useState } from "react";
import Link from "next/link";
import { tagPath } from "@/lib/paths";

export default function PopularTags({
  tags,
}: {
  tags: { name: string; count: number }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="popular-tags"
        className="mx-auto flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-xs text-sky-700 shadow-sm hover:bg-sky-50 sm:hidden"
      >
        人気タグ
        <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      <div
        id="popular-tags"
        className={`${
          open ? "mt-2 flex" : "hidden"
        } flex-wrap items-center justify-center gap-1.5 text-xs sm:mt-0 sm:flex`}
      >
        <span className="hidden text-gray-400 sm:inline">人気タグ:</span>
        {tags.map((p) => (
          <Link
            key={p.name}
            href={tagPath(p.name)}
            className="rounded-full bg-white px-3 py-1.5 text-sky-700 shadow-sm hover:bg-sky-50"
          >
            {p.name} <span className="text-gray-400">{p.count}</span>
          </Link>
        ))}
        <Link href="/students" className="px-2 py-1.5 text-sky-600 hover:underline">
          キャラ一覧 →
        </Link>
      </div>
    </div>
  );
}
