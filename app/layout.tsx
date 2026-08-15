import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import NotificationBell from "@/components/NotificationBell";
import ModeToggle from "@/components/ModeToggle";
import JsonLd from "@/components/JsonLd";
import ScrollTopButton from "@/components/ScrollTopButton";
import { SITE_NAME, SITE_DESC, SITE_URL } from "@/lib/site";
import { getMode } from "@/lib/mode";
import { getSetting, NOTICE_KEY } from "@/lib/db";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  openGraph: {
    siteName: SITE_NAME,
    url: SITE_URL,
    type: "website",
  },
  alternates: { canonical: "./" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mode = await getMode();
  const suffix = mode === "r18" ? "-r18" : mode === "sensitive" ? "-sens" : "";
  const badge =
    mode === "r18" ? (
      <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] not-italic tracking-normal text-white">
        R18
      </span>
    ) : mode === "sensitive" ? (
      <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] not-italic tracking-normal text-white">
        きわどい
      </span>
    ) : null;

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  // 管理人の一言（/admin で編集。空なら枠ごと非表示）
  const notice = getSetting(NOTICE_KEY).trim();
  const noticeStyle =
    mode === "r18"
      ? "border-rose-200 bg-rose-50 text-rose-900"
      : mode === "sensitive"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-sky-200 bg-[var(--ba-blue-pale)] text-[var(--ba-ink)]";

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESC,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/?tags={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        {/* ロゴ用フォント（ランタイム読み込み。失敗してもシステムフォントで表示継続） */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@800&display=swap"
        />
        {/* 広告は健全版のみ（成人向けページへの配信はAdSenseポリシー違反のため） */}
        {adsenseClient && mode === "all" && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        <header className="sticky top-0 z-30 bg-white/92 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5">
            <Link href="/" className="flex items-center gap-2">
              <span className={`ba-halo ba-halo${suffix}`} aria-hidden="true"></span>
              <span className={`ba-logo ba-logo${suffix}`}>{SITE_NAME}</span>
              {badge}
            </Link>
            <nav className="flex items-center gap-1 text-sm sm:gap-2">
              <ModeToggle mode={mode} />
              <Link
                href="/ranking"
                className="hidden rounded-md px-3 py-1.5 text-[var(--ba-ink)] hover:bg-[var(--ba-blue-pale)] sm:block"
              >
                ランキング
              </Link>
              <Link
                href="/students"
                className="hidden rounded-md px-3 py-1.5 text-[var(--ba-ink)] hover:bg-[var(--ba-blue-pale)] sm:block"
              >
                キャラ一覧
              </Link>
              <Link
                href="/favorites"
                className="hidden rounded-md px-3 py-1.5 text-[var(--ba-ink)] hover:bg-[var(--ba-blue-pale)] sm:block"
              >
                お気に入り
              </Link>
              <NotificationBell />
              <Link href="/register" className="ba-btn px-5 py-1.5 text-sm">
                <span>登録</span>
              </Link>
            </nav>
          </div>
          <div className={`ba-stripe-line ba-stripe-line${suffix}`} aria-hidden="true"></div>
        </header>
        {notice && (
          <div className={`border-b ${noticeStyle}`}>
            <div className="mx-auto flex w-full max-w-6xl items-start gap-2 px-4 py-2">
              <span className="mt-px shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-bold">
                管理人より
              </span>
              <p className="min-w-0 whitespace-pre-wrap text-sm leading-relaxed">{notice}</p>
            </div>
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-gray-400">
            <nav className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <Link href="/ranking" className="hover:text-sky-600">ランキング</Link>
              <Link href="/students" className="hover:text-sky-600">キャラ一覧</Link>
              <Link href="/following" className="hover:text-sky-600">フォロー中</Link>
              <Link href="/favorites" className="hover:text-sky-600">お気に入り</Link>
              <Link href="/mutes" className="hover:text-sky-600">ミュートリスト</Link>
              <Link href="/terms" className="hover:text-sky-600">利用規約・プライバシー</Link>
              <Link href="/removal" className="hover:text-sky-600">掲載停止のご依頼</Link>
              <Link href="/admin" className="hover:text-sky-600">管理</Link>
            </nav>
            <p>
              本サイトは非公式のファンサイトです。画像の著作権は各投稿者に帰属します。
            </p>
          </div>
        </footer>
        <ScrollTopButton mode={mode} />
      </body>
    </html>
  );
}
