import { NextRequest, NextResponse } from "next/server";
import { db, setPostTags, bulkAddTags, bulkDeletePosts, resolveRemovalRequest, deleteStudent } from "@/lib/db";
import { isAdminRequest } from "@/lib/adminAuth";
import { isTweetGone } from "@/lib/tweet";

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const action: string = body?.action;

  if (action === "setTags") {
    const postId = Number(body.postId);
    const tags: string[] = Array.isArray(body.tags) ? body.tags : [];
    if (!postId) return NextResponse.json({ error: "bad request" }, { status: 400 });
    setPostTags(postId, tags);
    return NextResponse.json({ ok: true });
  }

  // 複数投稿に同じタグを一括付与（既存タグは残す）
  if (action === "bulkSetTags") {
    const postIds: number[] = Array.isArray(body.postIds)
      ? body.postIds.map(Number).filter((n: number) => Number.isInteger(n) && n > 0).slice(0, 200)
      : [];
    const tags: string[] = Array.isArray(body.tags) ? body.tags : [];
    if (postIds.length === 0 || tags.length === 0) {
      return NextResponse.json({ error: "bad request" }, { status: 400 });
    }
    const count = bulkAddTags(postIds, tags);
    return NextResponse.json({ ok: true, count });
  }

  // 複数投稿を一括削除
  if (action === "bulkDelete") {
    const postIds: number[] = Array.isArray(body.postIds)
      ? body.postIds.map(Number).filter((n: number) => Number.isInteger(n) && n > 0).slice(0, 200)
      : [];
    if (postIds.length === 0) {
      return NextResponse.json({ error: "bad request" }, { status: 400 });
    }
    const count = bulkDeletePosts(postIds);
    return NextResponse.json({ ok: true, count });
  }

  if (action === "deletePost") {
    const postId = Number(body.postId);
    if (!postId) return NextResponse.json({ error: "bad request" }, { status: 400 });
    db.prepare("DELETE FROM post_students WHERE post_id = ?").run(postId);
    db.prepare("DELETE FROM likes WHERE post_id = ?").run(postId);
    db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
    return NextResponse.json({ ok: true });
  }

  if (action === "setRating") {
    const postId = Number(body.postId);
    const rating =
      body.rating === "r18" || body.rating === "sensitive" ? body.rating : "all";
    if (!postId) return NextResponse.json({ error: "bad request" }, { status: 400 });
    db.prepare("UPDATE posts SET rating = ? WHERE id = ?").run(rating, postId);
    return NextResponse.json({ ok: true });
  }

  if (action === "setStudent") {
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "bad request" }, { status: 400 });
    const school = String(body.school ?? "その他").trim() || "その他";
    const aliases = String(body.aliases ?? "").trim();
    db.prepare(
      `INSERT INTO students(name, school, aliases) VALUES (?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET school = excluded.school, aliases = excluded.aliases`
    ).run(name, school, aliases);
    return NextResponse.json({ ok: true });
  }

  if (action === "deleteStudent") {
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "bad request" }, { status: 400 });
    deleteStudent(name);
    return NextResponse.json({ ok: true });
  }

  if (action === "addSchool") {
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "bad request" }, { status: 400 });
    db.prepare(
      `INSERT OR IGNORE INTO schools(name, sort_order)
       VALUES (?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM schools))`
    ).run(name);
    return NextResponse.json({ ok: true });
  }

  if (action === "deleteSchool") {
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "bad request" }, { status: 400 });
    if (name === "その他") {
      return NextResponse.json({ error: "「その他」は削除できません" }, { status: 400 });
    }
    // 所属生徒は「その他」へ移してから削除
    db.prepare("UPDATE students SET school = 'その他' WHERE school = ?").run(name);
    db.prepare("DELETE FROM schools WHERE name = ?").run(name);
    return NextResponse.json({ ok: true });
  }

  if (action === "resolveRemoval") {
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "bad request" }, { status: 400 });
    resolveRemovalRequest(id);
    return NextResponse.json({ ok: true });
  }

  // 消えたツイートの検出（1回の実行で最大30件チェック、古い順に巡回）
  if (action === "checkDead") {
    const rows = db
      .prepare(
        `SELECT id, tweet_id FROM posts WHERE status = 'approved'
         ORDER BY id ASC LIMIT 30 OFFSET ?`
      )
      .all(Number(body.offset) || 0) as { id: number; tweet_id: string }[];
    let dead = 0;
    for (const row of rows) {
      if (await isTweetGone(row.tweet_id)) {
        db.prepare("UPDATE posts SET status = 'dead' WHERE id = ?").run(row.id);
        dead++;
      }
    }
    return NextResponse.json({ ok: true, checked: rows.length, dead });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
