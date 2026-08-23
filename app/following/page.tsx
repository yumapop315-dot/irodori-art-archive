import Link from "next/link";
import Feed from "@/components/Feed";
import { isAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export const metadata = { title: "フォロー中の生徒" };

export default async function FollowingPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="ba-heading text-xl">フォロー中の生徒</h1>
        <Link href="/students" className="text-sm text-sky-600 hover:underline">
          フォローを管理 →
        </Link>
      </div>
      <Feed source={{ kind: "following" }} isAdmin={await isAdminRequest()} />
    </div>
  );
}
