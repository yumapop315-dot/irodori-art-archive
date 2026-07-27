// ページ送りナビ（サーバーコンポーネント）
import Link from "next/link";

function pageWindow(current: number, total: number): (number | "…")[] {
  const pages = new Set<number>([1, total, current - 1, current, current + 1, current - 2, current + 2]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of list) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({
  current,
  totalPages,
  hrefFor,
}: {
  current: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-sm" aria-label="ページ送り">
      {current > 1 && (
        <Link
          href={hrefFor(current - 1)}
          className="rounded-full bg-white px-4 py-2 shadow-sm hover:bg-sky-100"
        >
          ← 前へ
        </Link>
      )}
      {pageWindow(current, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === current ? "page" : undefined}
            className={`min-w-9 rounded-full px-3 py-2 text-center tabular-nums ${
              p === current
                ? "bg-sky-500 font-bold text-white"
                : "bg-white text-gray-600 shadow-sm hover:bg-sky-100"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {current < totalPages && (
        <Link
          href={hrefFor(current + 1)}
          className="rounded-full bg-white px-4 py-2 shadow-sm hover:bg-sky-100"
        >
          次へ →
        </Link>
      )}
    </nav>
  );
}
