import { NextRequest, NextResponse } from "next/server";
import { db, setPostTags, studentEntries, type Rating } from "@/lib/db";
import { extractTweetId, fetchTweetInfo, FETCH_ERROR_MESSAGES } from "@/lib/tweet";
import { autoDetectStudents, type StudentEntry } from "@/lib/normalize";
import { allow, clientIp } from "@/lib/ratelimit";
import { getMode } from "@/lib/mode";

async function registerOne(
  url: string,
  tags: string[],
  rating: Rating,
  entries: StudentEntry[]
): Promise<{ ok: boolean; error?: string; id?: number; autoTagged?: string[] }> {
  const parsed = extractTweetId(url);
  if (!parsed) return { ok: false, error: "X(Twitter)の投稿URLではありません" };

  const exists = db.prepare("SELECT id FROM posts WHERE tweet_id = ?").get(parsed.id);
  if (exists) return { ok: false, error: "この投稿は登録済みです" };

  const result = await fetchTweetInfo(parsed.id);
  if (!result.ok) return { ok: false, error: FETCH_ERROR_MESSAGES[result.reason] };
  const info = result.info;
  if (info.photos.length === 0) return { ok: false, error: "画像が含まれていない投稿は登録できません" };

  const res = db
    .prepare(
      `INSERT INTO posts (tweet_id, url, author_name, screen_name, text, posted_at, photos, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      info.tweetId, info.url, info.authorName, info.screenName,
      info.text, info.postedAt, JSON.stringify(info.photos), rating
    );
  const id = Number(res.lastInsertRowid);

  if (tags.length > 0) {
    // 登録者が明示指定したタグ（確認済み扱い）
    setPostTags(id, tags);
    return { ok: true, id };
  }
  // 投稿者本人がハッシュタグ等でキャラを明示していれば自動タグ付け＆自動公開
  const auto = autoDetectStudents(info.text, entries);
  if (auto.length > 0) {
    setPostTags(id, auto, { auto: true });
    return { ok: true, id, autoTagged: auto };
  }
  return { ok: true, id };
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rating = await getMode();
  const entries = studentEntries();
  const body = await req.json().catch(() => null);
  const tags: string[] = Array.isArray(body?.tags) ? body.tags.slice(0, 10) : [];

  // 一括登録: urls配列（1リクエストにつき最大20件。クライアントが分割送信する）
  if (Array.isArray(body?.urls)) {
    const urls: string[] = body.urls.filter((u: unknown) => typeof u === "string").slice(0, 20);
    // 1000件（=50リクエスト）を1回のバッチで通せるよう緩めに設定
    if (!allow(`register-bulk:${ip}`, 80, 600)) {
      return NextResponse.json({ error: "登録が多すぎます。10分ほど待ってください" }, { status: 429 });
    }
    const results = [];
    for (const url of urls) {
      results.push({ url, ...(await registerOne(url, tags, rating, entries)) });
    }
    return NextResponse.json({ results });
  }

  // 単発登録
  if (!allow(`register:${ip}`, 5, 600)) {
    return NextResponse.json({ error: "登録が多すぎます。10分ほど待ってください" }, { status: 429 });
  }
  const result = await registerOne(body?.url ?? "", tags, rating, entries);
  if (!result.ok) {
    const status = result.error === "この投稿は登録済みです" ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, id: result.id, autoTagged: result.autoTagged ?? [] });
}
