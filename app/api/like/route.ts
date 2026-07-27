import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const postId = Number(body?.postId);
  const clientId: string = body?.clientId ?? "";

  if (!postId || !clientId || clientId.length > 64) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const post = db.prepare("SELECT id FROM posts WHERE id = ?").get(postId);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  const existing = db
    .prepare("SELECT 1 FROM likes WHERE post_id = ? AND client_id = ?")
    .get(postId, clientId);

  let liked: boolean;
  if (existing) {
    db.prepare("DELETE FROM likes WHERE post_id = ? AND client_id = ?").run(postId, clientId);
    liked = false;
  } else {
    db.prepare("INSERT INTO likes(post_id, client_id) VALUES (?, ?)").run(postId, clientId);
    liked = true;
  }
  const count = (
    db.prepare("SELECT COUNT(*) AS c FROM likes WHERE post_id = ?").get(postId) as { c: number }
  ).c;
  return NextResponse.json({ liked, count });
}
