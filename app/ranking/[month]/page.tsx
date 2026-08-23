import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { monthlyArchive, monthsWithPosts, toJson, RATING_LABELS } from "@/lib/db";
import { getMode } from "@/lib/mode";
import PostGrid from "@/components/PostGrid";
import { isAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ month: string }> };

function parseMonth(month: string): { start: number; end: number; label: string } | null {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  const start = Date.UTC(y, m - 1, 1) / 1000 - 9 * 3600; // JST基準の月初
  const end = Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1) / 1000 - 9 * 3600;
  return { start, end, label: `${y}年${m}月` };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = parseMonth((await params).month);
  if (!parsed) return {};
  return {
    title: `${parsed.label}の人気イラスト`,
    description: `ブルーアーカイブ ファンアート ${parsed.label}の月間人気ランキング。`,
  };
}

export default async function MonthlyRankingPage({ params }: Props) {
  const { month } = await params;
  const parsed = parseMonth(month);
  if (!parsed) notFound();

  const mode = await getMode();
  const posts = monthlyArchive(mode, parsed.start, parsed.end, 30);
  const months = monthsWithPosts(mode);
  const idx = months.indexOf(month);
  const newer = idx > 0 ? months[idx - 1] : null;
  const older = idx >= 0 && idx < months.length - 1 ? months[idx + 1] : null;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h1 className="ba-heading text-xl">
          {parsed.label}の人気イラスト
          {mode !== "all" && (
            <span className="ml-2 text-sm font-normal text-gray-500">（{RATING_LABELS[mode]}）</span>
          )}
        </h1>
        <Link href="/ranking" className="text-sm text-sky-600 hover:underline">
          週間ランキングへ →
        </Link>
      </div>
      <p className="mb-5 text-sm text-gray-500">
        {parsed.label}に投稿された作品を、いいね数の多い順に最大30件掲載しています。
      </p>

      <PostGrid posts={posts.map(toJson)} ranked isAdmin={await isAdminRequest()} />

      <nav className="mt-8 flex justify-center gap-4 text-sm">
        {older && (
          <Link href={`/ranking/${older}`} className="rounded-full bg-white px-4 py-2 shadow-sm hover:bg-sky-100">
            ← 前の月
          </Link>
        )}
        {newer && (
          <Link href={`/ranking/${newer}`} className="rounded-full bg-white px-4 py-2 shadow-sm hover:bg-sky-100">
            次の月 →
          </Link>
        )}
      </nav>
    </div>
  );
}
