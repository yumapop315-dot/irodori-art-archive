"use client";

import Link from "next/link";
import Feed from "@/components/Feed";

export default function FollowingPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="ba-heading text-xl">フォロー中の生徒</h1>
        <Link href="/students" className="text-sm text-sky-600 hover:underline">
          フォローを管理 →
        </Link>
      </div>
      <Feed source={{ kind: "following" }} />
    </div>
  );
}
