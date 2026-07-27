// 消えたツイートの検出バッチ（cron等から実行: node scripts/check-dead.mjs）
import Database from "better-sqlite3";
import { getTweet } from "react-tweet/api";
import path from "path";

const db = new Database(path.join(process.cwd(), "data", "app.db"));
const rows = db
  .prepare("SELECT id, tweet_id, screen_name FROM posts WHERE status = 'approved' ORDER BY id")
  .all();

let dead = 0;
for (const row of rows) {
  let gone = false;
  try {
    gone = (await getTweet(row.tweet_id)) == null;
  } catch {
    gone = true;
  }
  if (gone) {
    db.prepare("UPDATE posts SET status = 'dead' WHERE id = ?").run(row.id);
    console.log(`dead: @${row.screen_name} (${row.tweet_id})`);
    dead++;
  }
  await new Promise((r) => setTimeout(r, 500));
}
console.log(`checked ${rows.length}, marked ${dead} as dead`);
