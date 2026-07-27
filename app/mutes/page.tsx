"use client";

import { useEffect, useState } from "react";
import { mutes } from "@/lib/clientStore";

export default function MutesPage() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => setList(mutes.get()), []);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="ba-heading mb-1 text-xl">ミュートリスト</h1>
      <p className="mb-6 text-sm text-gray-500">
        ミュート中の作者の投稿は一覧に表示されません（このブラウザのみ）。
      </p>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          ミュート中の作者はいません。カードの「⋯」メニューからミュートできます。
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5"
            >
              <span className="text-sm">@{name}</span>
              <button
                onClick={() => {
                  mutes.remove(name);
                  setList(mutes.get());
                }}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
              >
                解除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
