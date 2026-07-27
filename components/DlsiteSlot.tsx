// DLsiteアフィリエイトの導線枠（サーバーコンポーネント）。
// 健全版(all)では必ずnullを返すので、健全版に成人向け導線が混ざる事故は構造的に起きない。
import type { Rating } from "@/lib/db";
import { dlsitePromoLink } from "@/lib/dlsite";

export default function DlsiteSlot({
  mode,
  character,
  variant = "banner",
}: {
  mode: Rating;
  character?: string | null;
  variant?: "banner" | "infeed";
}) {
  // 健全版には絶対に出さない（AdSenseと成人向け導線の同居はポリシー違反）
  if (mode === "all") return null;

  const promo = dlsitePromoLink(character);
  // アフィリIDが未設定なら枠ごと非表示
  if (!promo) return null;

  const label = character
    ? `${character}の同人作品をDLsiteで探す`
    : "ブルーアーカイブの同人作品をDLsiteで探す";

  return (
    <aside
      className={`overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm ${
        variant === "infeed" ? "mb-4" : ""
      }`}
    >
      <a
        href={promo.url}
        target="_blank"
        // sponsored: 広告リンクであることを検索エンジンに明示
        rel="sponsored noopener noreferrer"
        className="block p-4 transition hover:bg-amber-50/70"
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            PR
          </span>
          <span className="text-[11px] text-amber-700">DLsite</span>
        </div>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="mt-1 text-xs text-gray-500">
          「{promo.keyword}」の検索結果へ（外部サイト・18歳未満閲覧禁止）
        </p>
      </a>
    </aside>
  );
}
