import { NextRequest, NextResponse } from "next/server";
import { searchPosts, postsByIds, countNewSince, studentEntries, toJson } from "@/lib/db";
import { resolveToken } from "@/lib/normalize";
import { getMode } from "@/lib/mode";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const rating = await getMode();

  // お気に入り一覧用: id指定。自分でいいねしたものなので、
  // 現在のモードに関係なく健全/きわどい/R18をすべて返す
  const idsParam = sp.get("ids");
  if (idsParam !== null) {
    const ids = idsParam.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 100);
    return NextResponse.json({ posts: postsByIds(ids, "any").map(toJson) });
  }

  const students = studentEntries();
  const rawTags = (sp.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  // 通知バッジ用: フォロー中キャラの新着件数
  const since = Number(sp.get("sinceCount"));
  if (since > 0) {
    const names = rawTags
      .map((t) => resolveToken(t, students))
      .filter((r) => r.ok)
      .map((r) => (r as { ok: true; name: string }).name);
    return NextResponse.json({ count: countNewSince(names, since, rating) });
  }

  // 表記ゆれ解決
  const resolved: string[] = [];
  const unresolved: { token: string; candidates: string[] }[] = [];
  for (const t of rawTags) {
    const r = resolveToken(t, students);
    if (r.ok) resolved.push(r.name);
    else unresolved.push({ token: r.token, candidates: r.candidates });
  }

  // 解決できない語がある場合は0件+候補を返す
  if (unresolved.length > 0) {
    return NextResponse.json({ posts: [], total: 0, resolved, unresolved });
  }

  const sort = sp.get("sort") ?? "new";
  const mode = sp.get("mode") === "or" ? "or" : "and";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const perPage = Math.min(50, Math.max(1, Number(sp.get("perPage")) || 24));

  const author = sp.get("author")?.trim() || undefined;
  const { posts, total } = searchPosts({
    tags: resolved, sort, page, perPage, mode, rating, author,
    publicOnly: true,
  });
  return NextResponse.json({ posts: posts.map(toJson), total, resolved, unresolved: [] });
}
