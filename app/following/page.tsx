"use client";

import { useEffect } from "react";
import Link from "next/link";
import Feed from "@/components/Feed";
import { followLastSeen } from "@/lib/clientStore";

export default function FollowingPage() {
  // このページを開いた時点で通知バッジをリセット
  useEffect(() => {
    followLastSeen.touch();
  }, []);

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
