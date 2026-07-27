import { fetchTweet } from "react-tweet/api";
import type { Photo } from "./db";

export function extractTweetId(url: string): { screenName: string; id: string } | null {
  const m = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status(?:es)?\/(\d+)/);
  return m ? { screenName: m[1], id: m[2] } : null;
}

export type TweetInfo = {
  tweetId: string;
  url: string;
  authorName: string;
  screenName: string;
  text: string;
  postedAt: number;
  photos: Photo[];
};

export type TweetFetchResult =
  | { ok: true; info: TweetInfo }
  | { ok: false; reason: "restricted" | "notfound" | "error" };

// センシティブ設定・年齢制限付きの投稿はX公式の配信APIが内容を返さないため、
// FixTweetの公開API (api.fxtwitter.com) にフォールバックして取得する
async function fetchViaFxTwitter(tweetId: string): Promise<TweetInfo | null> {
  try {
    const r = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
      headers: { "User-Agent": "irodori-art-archive/1.0" },
    });
    if (!r.ok) return null;
    const d = await r.json();
    const t = d?.tweet;
    if (!t?.author?.screen_name) return null;
    const photos: Photo[] = (t.media?.photos ?? []).map(
      (p: { url: string; width: number; height: number }) => ({
        url: String(p.url).split("?")[0],
        width: p.width,
        height: p.height,
      })
    );
    return {
      tweetId,
      url: `https://x.com/${t.author.screen_name}/status/${tweetId}`,
      authorName: t.author.name ?? t.author.screen_name,
      screenName: t.author.screen_name,
      text: String(t.text ?? "").replace(/https:\/\/t\.co\/\w+/g, "").trim(),
      postedAt:
        t.created_timestamp ??
        Math.floor(new Date(t.created_at).getTime() / 1000),
      photos,
    };
  } catch {
    return null;
  }
}

// 取得失敗の理由:
// - restricted: センシティブ設定・年齢制限付きで、フォールバックでも取得できなかった
// - notfound:   削除済み・非公開アカウント・ID間違い
// - error:      通信エラー等
export async function fetchTweetInfo(tweetId: string): Promise<TweetFetchResult> {
  let res;
  try {
    res = await fetchTweet(tweetId);
  } catch {
    return { ok: false, reason: "error" };
  }
  if (res.tombstone) {
    // センシティブ/年齢制限 → FixTweetで再試行
    const fx = await fetchViaFxTwitter(tweetId);
    if (fx) return { ok: true, info: fx };
    return { ok: false, reason: "restricted" };
  }
  if (!res.data) return { ok: false, reason: "notfound" };
  const tweet = res.data;
  return {
    ok: true,
    info: {
      tweetId,
      url: `https://x.com/${tweet.user.screen_name}/status/${tweetId}`,
      authorName: tweet.user.name,
      screenName: tweet.user.screen_name,
      text: tweet.text.replace(/https:\/\/t\.co\/\w+/g, "").trim(),
      postedAt: Math.floor(new Date(tweet.created_at).getTime() / 1000),
      photos: (tweet.photos ?? []).map((p) => ({
        url: p.url,
        width: p.width,
        height: p.height,
      })),
    },
  };
}

export const FETCH_ERROR_MESSAGES: Record<"restricted" | "notfound" | "error", string> = {
  restricted:
    "センシティブ設定の投稿の取得に失敗しました。時間をおいてもう一度お試しください（それでも失敗する場合、この投稿は取得不能です）",
  notfound:
    "投稿が見つかりません（削除済み・非公開アカウント・URLの間違いのいずれかです）",
  error: "通信エラーで取得できませんでした。しばらくしてからもう一度お試しください",
};

// 削除・非公開チェック: 完全に消えた場合のみ true
// （センシティブ設定の投稿は存在しており画像も表示できるため対象外）
export async function isTweetGone(tweetId: string): Promise<boolean> {
  const res = await fetchTweetInfo(tweetId);
  return !res.ok && res.reason === "notfound";
}
