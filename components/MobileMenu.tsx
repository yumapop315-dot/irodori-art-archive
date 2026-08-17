"use client";

// スマホ幅ではヘッダーのリンク（ランキング/キャラ一覧/お気に入り）が隠れるので、
// その代わりに開くプルダウン。sm以上では非表示（PCは元のリンクがそのまま出る）。
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: [string, string][] = [
  ["/ranking", "ランキング"],
  ["/students", "キャラ一覧"],
  ["/favorites", "お気に入り"],
  ["/following", "フォロー中"],
  ["/mutes", "ミュートリスト"],
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ページを移動したら閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="メニュー"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ba-ink)] hover:bg-[var(--ba-blue-pale)]"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* メニュー外をタップしたら閉じる */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {ITEMS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
                className={`block px-4 py-2.5 text-sm hover:bg-[var(--ba-blue-pale)] ${
                  pathname === href
                    ? "font-bold text-sky-600"
                    : "text-[var(--ba-ink)]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
