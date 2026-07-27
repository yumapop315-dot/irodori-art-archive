import { NextRequest, NextResponse } from "next/server";
import { db, studentEntries } from "@/lib/db";
import { extractTweetId, fetchTweetInfo, FETCH_ERROR_MESSAGES } from "@/lib/tweet";
import { suggestTagsFromText } from "@/lib/normalize";
import { allow, clientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  if (!allow(`preview:${clientIp(req)}`, 30, 600)) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらく待ってください" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = extractTweetId(body?.url ?? "");
  if (!parsed) {
    return NextResponse.json(
      { error: "X(Twitter)の投稿URLではありません" },
      { status: 400 }
    );
  }

  const exists = db.prepare("SELECT id FROM posts WHERE tweet_id = ?").get(parsed.id);
  if (exists) {
    return NextResponse.json({ error: "この投稿は登録済みです" }, { status: 409 });
  }

  const result = await fetchTweetInfo(parsed.id);
  if (!result.ok) {
    return NextResponse.json(
      { error: FETCH_ERROR_MESSAGES[result.reason] },
      { status: result.reason === "error" ? 502 : 404 }
    );
  }
  if (result.info.photos.length === 0) {
    return NextResponse.json(
      { error: "画像が含まれていない投稿は登録できません" },
      { status: 400 }
    );
  }

  const suggestedTags = suggestTagsFromText(result.info.text, studentEntries());
  return NextResponse.json({ tweet: result.info, suggestedTags });
}
