// 既存投稿の photos 列を埋める一回きりのマイグレーション
import Database from "better-sqlite3";
import { getTweet } from "react-tweet/api";
import path from "path";

const db = new Database(path.join(process.cwd(), "data", "app.db"));
const rows = db
  .prepare("SELECT id, tweet_id FROM posts WHERE photos = '[]' OR photos IS NULL")
  .all();

for (const row of rows) {
  try {
    const tweet = await getTweet(row.tweet_id);
    if (!tweet) {
      console.log(`skip (gone): ${row.tweet_id}`);
      continue;
    }
    const photos = (tweet.photos ?? []).map((p) => ({
      url: p.url,
      width: p.width,
      height: p.height,
    }));
    db.prepare("UPDATE posts SET photos = ? WHERE id = ?").run(JSON.stringify(photos), row.id);
    console.log(`ok: ${row.tweet_id} (${photos.length} photos)`);
  } catch (e) {
    console.log(`error: ${row.tweet_id}`, e.message);
  }
  await new Promise((r) => setTimeout(r, 500));
}
console.log(`done: ${rows.length} rows`);
