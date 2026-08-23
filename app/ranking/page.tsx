import Link from "next/link";
import { monthsWithPosts, weeklyRanking, toJson, RATING_LABELS } from "@/lib/db";
import { getMode } from "@/lib/mode";
import PostGrid from "@/components/PostGrid";
import { isAdminRequest } from "@/lib/adminAuth";
import DlsiteSlot from "@/components/DlsiteSlot";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "週間ランキング",
  description: "ブルーアーカイブのファンアート週間人気ランキング。過去7日間で人気だったイラストTOP20。",
};

export default async function RankingPage() {
  const mode = await getMode();
  const posts = weeklyRanking(mode, 7, 20);
  const months = monthsWithPosts(mode);

  return (
    <div>
      <h1 className="ba-heading mb-1 text-xl">
        週間ランキング
        {mode !== "all" && (
          <span className="ml-2 text-sm font-normal text-gray-500">（{RATING_LABELS[mode]}）</span>
        )}
      </h1>
      <p className="mb-5 text-sm text-gray-500">
        過去7日間についた「いいね」で集計したTOP20です。毎日変動します。
      </p>

      <PostGrid
        posts={posts.map(toJson)}
        ranked
        promo={<DlsiteSlot mode={mode} variant="infeed" />}
        isAdmin={await isAdminRequest()}
      />

      <div className="mt-8">
        <DlsiteSlot mode={mode} />
      </div>

      {months.length > 0 && (
        <section className="mt-10">
          <h2 className="ba-heading mb-3 text-base">月別アーカイブ</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {months.map((m) => {
              const [y, mo] = m.split("-");
              return (
                <Link
                  key={m}
                  href={`/ranking/${m}`}
                  className="ba-chip px-4 py-1.5"
                >
                  <span>
                    {y}年{Number(mo)}月
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
