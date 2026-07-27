"use client";

import { useEffect, useState } from "react";
import { follows } from "@/lib/clientStore";

export default function FollowButton({ name }: { name: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(follows.has(name)), [name]);
  return (
    <button
      onClick={() => setOn(follows.toggle(name))}
      aria-pressed={on}
      className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
        on
          ? "bg-sky-500 font-semibold text-white"
          : "border border-gray-300 text-gray-500 hover:border-sky-400 hover:text-sky-600"
      }`}
    >
      {on ? "フォロー中" : "フォロー"}
    </button>
  );
}
