import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { StudentEntry } from "./normalize";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// [名前, 学園, 別名(フルネーム等)]
const SEED: [string, string, string][] = [
  ["ホシノ", "アビドス", "小鳥遊ホシノ"],
  ["シロコ", "アビドス", "砂狼シロコ"],
  ["セリカ", "アビドス", "黒見セリカ"],
  ["ノノミ", "アビドス", "十六夜ノノミ"],
  ["アヤネ", "アビドス", "奥空アヤネ"],
  ["ヒナ", "ゲヘナ", "空崎ヒナ"],
  ["アコ", "ゲヘナ", "天雨アコ"],
  ["イオリ", "ゲヘナ", "銀鏡イオリ"],
  ["チナツ", "ゲヘナ", "火宮チナツ"],
  ["アル", "ゲヘナ", "陸八魔アル"],
  ["ムツキ", "ゲヘナ", "浅黄ムツキ"],
  ["カヨコ", "ゲヘナ", "鬼方カヨコ"],
  ["ハルカ", "ゲヘナ", ""],
  ["ハルナ", "ゲヘナ", ""],
  ["ジュリ", "ゲヘナ", ""],
  ["フウカ", "ゲヘナ", ""],
  ["ジュンコ", "ゲヘナ", ""],
  ["イロハ", "ゲヘナ", ""],
  ["マキ", "ゲヘナ", ""],
  ["メグ", "ゲヘナ", ""],
  ["サツキ", "ゲヘナ", ""],
  ["カスミ", "ゲヘナ", ""],
  ["ミカ", "トリニティ", "聖園ミカ"],
  ["ナギサ", "トリニティ", "桐藤ナギサ"],
  ["セイア", "トリニティ", "百合園セイア"],
  ["ヒフミ", "トリニティ", "阿慈谷ヒフミ"],
  ["アズサ", "トリニティ", "白洲アズサ"],
  ["ハナコ", "トリニティ", "浦和ハナコ"],
  ["コハル", "トリニティ", "下江コハル"],
  ["マシロ", "トリニティ", "静山マシロ"],
  ["ツルギ", "トリニティ", ""],
  ["ウイ", "トリニティ", ""],
  ["ヒナタ", "トリニティ", ""],
  ["サクラコ", "トリニティ", ""],
  ["ミネ", "トリニティ", ""],
  ["カエデ", "トリニティ", ""],
  ["ユウカ", "ミレニアム", "早瀬ユウカ"],
  ["ノア", "ミレニアム", "生塩ノア"],
  ["リオ", "ミレニアム", "調月リオ"],
  ["アリス", "ミレニアム", "天童アリス"],
  ["ユズ", "ミレニアム", "花岡ユズ"],
  ["モモイ", "ミレニアム", "才羽モモイ"],
  ["ミドリ", "ミレニアム", "才羽ミドリ"],
  ["ネル", "ミレニアム", ""],
  ["カリン", "ミレニアム", "角楯カリン"],
  ["アカネ", "ミレニアム", ""],
  ["アスナ", "ミレニアム", "一之瀬アスナ"],
  ["トキ", "ミレニアム", ""],
  ["ヒビキ", "ミレニアム", ""],
  ["ウタハ", "ミレニアム", ""],
  ["コタマ", "ミレニアム", ""],
  ["エイミ", "ミレニアム", ""],
  ["ハレ", "ミレニアム", ""],
  ["コユキ", "ミレニアム", ""],
  ["ヒマリ", "ミレニアム", "明星ヒマリ"],
  ["ミヤコ", "SRT", ""],
  ["ミユ", "SRT", ""],
  ["サキ", "SRT", ""],
  ["モエ", "SRT", ""],
  ["サオリ", "アリウス", "錠前サオリ"],
  ["ミサキ", "アリウス", ""],
  ["アツコ", "アリウス", ""],
  ["ヒヨリ", "アリウス", ""],
  ["シュン", "山海経", ""],
  ["キサキ", "山海経", ""],
  ["サヤ", "山海経", ""],
  ["ルミ", "山海経", ""],
  ["ワカモ", "百鬼夜行", ""],
  ["ニヤ", "百鬼夜行", ""],
  ["イズナ", "百鬼夜行", ""],
  ["チェリノ", "レッドウィンター", ""],
  ["マリナ", "レッドウィンター", ""],
  ["ミノリ", "レッドウィンター", ""],
  ["トモエ", "レッドウィンター", ""],
  ["アロナ", "その他", ""],
  ["プラナ", "その他", ""],
  ["セリナ", "その他", ""],
  ["ハナエ", "その他", ""],
  ["アイリ", "その他", ""],
  ["コトリ", "その他", ""],
  ["フブキ", "その他", ""],
  ["キリノ", "その他", ""],
  ["ナツ", "その他", ""],
  ["ヨシミ", "その他", ""],
  ["レイサ", "その他", ""],
  ["カズサ", "その他", "杏山カズサ"],
  ["アカリ", "その他", ""],
  ["チセ", "その他", ""],
  ["ツバキ", "その他", ""],
  ["チヒロ", "その他", ""],
  ["ネル", "ミレニアム", ""],
];

const SCHOOL_ORDER = [
  "アビドス", "ゲヘナ", "トリニティ", "ミレニアム", "SRT",
  "アリウス", "山海経", "百鬼夜行", "レッドウィンター", "その他",
];

function hasColumn(db: Database.Database, table: string, col: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === col);
}

function createDb() {
  const db = new Database(path.join(dataDir, "app.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tweet_id TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      author_name TEXT NOT NULL DEFAULT '',
      screen_name TEXT NOT NULL DEFAULT '',
      text TEXT NOT NULL DEFAULT '',
      posted_at INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      status TEXT NOT NULL DEFAULT 'approved'
    );
    CREATE TABLE IF NOT EXISTS post_students (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, student_id)
    );
    CREATE TABLE IF NOT EXISTS likes (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (post_id, client_id)
    );
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS removal_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      contact TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      resolved INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_likes_created ON likes(created_at);
  `);

  // マイグレーション（既存DBに列を追加）
  if (!hasColumn(db, "posts", "photos")) {
    db.exec(`ALTER TABLE posts ADD COLUMN photos TEXT NOT NULL DEFAULT '[]'`);
  }
  if (!hasColumn(db, "students", "school")) {
    db.exec(`ALTER TABLE students ADD COLUMN school TEXT NOT NULL DEFAULT 'その他'`);
  }
  if (!hasColumn(db, "students", "aliases")) {
    db.exec(`ALTER TABLE students ADD COLUMN aliases TEXT NOT NULL DEFAULT ''`);
  }
  if (!hasColumn(db, "posts", "rating")) {
    db.exec(`ALTER TABLE posts ADD COLUMN rating TEXT NOT NULL DEFAULT 'all'`);
  }
  // 自動タグ付けされた（管理人未確認の）投稿の目印
  if (!hasColumn(db, "posts", "auto_tagged")) {
    db.exec(`ALTER TABLE posts ADD COLUMN auto_tagged INTEGER NOT NULL DEFAULT 0`);
  }

  // 陣営（学園）マスタのシード
  const schoolCount = (db.prepare("SELECT COUNT(*) AS c FROM schools").get() as { c: number }).c;
  if (schoolCount === 0) {
    const ins = db.prepare("INSERT OR IGNORE INTO schools(name, sort_order) VALUES (?, ?)");
    SCHOOL_ORDER.forEach((name, i) => ins.run(name, i));
  }

  // シード（冪等: 名前がなければ挿入、学園/別名が既知なら未設定のものだけ埋める）
  const ins = db.prepare(
    "INSERT OR IGNORE INTO students(name, school, aliases) VALUES (?, ?, ?)"
  );
  const upd = db.prepare(
    "UPDATE students SET school = ?, aliases = ? WHERE name = ? AND school = 'その他' AND aliases = ''"
  );
  const tx = db.transaction(() => {
    for (const [name, school, aliases] of SEED) {
      ins.run(name, school, aliases);
      if (school !== "その他" || aliases !== "") upd.run(school, aliases, name);
    }
  });
  tx();
  return db;
}

const g = globalThis as unknown as { __db?: Database.Database };
export const db = g.__db ?? (g.__db = createDb());

export type Photo = { url: string; width: number; height: number };

// all=健全 / sensitive=きわどい / r18=R18
export type Rating = "all" | "sensitive" | "r18";

export const RATING_LABELS: Record<Rating, string> = {
  all: "健全版",
  sensitive: "きわどい版",
  r18: "R18版",
};

export type PostRow = {
  id: number;
  tweet_id: string;
  url: string;
  author_name: string;
  screen_name: string;
  text: string;
  posted_at: number;
  created_at: number;
  status: string;
  rating: string;
  auto_tagged: number;
  like_count: number;
  tags: string;
  photos: string;
};

export type PostJson = Omit<PostRow, "tags" | "photos"> & {
  tags: string[];
  photos: Photo[];
};

export function toJson(r: PostRow): PostJson {
  let photos: Photo[] = [];
  try { photos = JSON.parse(r.photos || "[]"); } catch {}
  return { ...r, tags: r.tags ? r.tags.split(",") : [], photos };
}

// 公開条件（公開側の全クエリで共通）: キャラタグが1つ以上付いていて、
// かつ管理人が確認済み（auto_tagged=0）であること。
// 登録時の自動タグ付けだけの投稿は auto_tagged=1 なので公開側には出ない。
const PUBLISHED =
  "EXISTS (SELECT 1 FROM post_students ps WHERE ps.post_id = p.id) AND p.auto_tagged = 0";

const SORTS: Record<string, string> = {
  new: "p.created_at DESC, p.id DESC",
  posted_at: "p.posted_at DESC, p.id DESC",
  daily: "recent_likes DESC, p.created_at DESC",
  monthly: "recent_likes DESC, p.created_at DESC",
  latest_favorites: "last_like DESC",
  random: "RANDOM()",
};

export function searchPosts(opts: {
  tags: string[];
  sort: string;
  page: number;
  perPage: number;
  status?: string;
  mode?: "and" | "or";
  untaggedOnly?: boolean;
  publicOnly?: boolean; // 公開側: タグ未設定・自動タグ未確認の投稿を隠す
  autoTaggedOnly?: boolean; // 管理: 自動タグ付け済み（未確認）だけ
  rating?: Rating | "any";
  author?: string; // screen_nameで絞り込み（絵師ページ用）
}): { posts: PostRow[]; total: number } {
  const { tags, page, perPage } = opts;
  const sort = SORTS[opts.sort] ? opts.sort : "new";
  const mode = opts.mode ?? "and";
  const status = opts.status ?? "approved";
  const rating = opts.rating ?? "all";

  const likeWindow = sort === "daily" ? 86400 : sort === "monthly" ? 2592000 : 0;
  const where: string[] = [];
  const params: Record<string, unknown> = { likeWindow };

  if (status !== "all") {
    where.push("p.status = @status");
    params.status = status;
  }
  if (rating !== "any") {
    where.push("p.rating = @rating");
    params.rating = rating;
  }
  if (opts.untaggedOnly) {
    where.push("NOT EXISTS (SELECT 1 FROM post_students ps WHERE ps.post_id = p.id)");
  }
  if (opts.publicOnly) {
    where.push(`(${PUBLISHED})`);
  }
  if (opts.autoTaggedOnly) {
    where.push("p.auto_tagged = 1");
  }
  if (opts.author) {
    where.push("p.screen_name = @author COLLATE NOCASE");
    params.author = opts.author;
  }

  if (tags.length > 0) {
    const conds = tags.map((t, i) => {
      params[`tag${i}`] = t;
      return `EXISTS (
        SELECT 1 FROM post_students ps
        JOIN students s ON s.id = ps.student_id
        WHERE ps.post_id = p.id AND s.name = @tag${i}
      )`;
    });
    where.push(mode === "or" ? `(${conds.join(" OR ")})` : conds.join(" AND "));
  }

  const whereSql = where.length ? where.join(" AND ") : "1=1";
  const total = (
    db.prepare(`SELECT COUNT(*) AS c FROM posts p WHERE ${whereSql}`).get(params) as { c: number }
  ).c;

  const rows = db
    .prepare(
      `SELECT p.*,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id
          AND (@likeWindow = 0 OR l.created_at > unixepoch() - @likeWindow)) AS recent_likes,
        (SELECT MAX(l.created_at) FROM likes l WHERE l.post_id = p.id) AS last_like,
        (SELECT GROUP_CONCAT(s.name, ',') FROM post_students ps
          JOIN students s ON s.id = ps.student_id WHERE ps.post_id = p.id) AS tags
      FROM posts p
      WHERE ${whereSql}
      ORDER BY ${SORTS[sort]}
      LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: perPage, offset: (page - 1) * perPage }) as PostRow[];

  return { posts: rows.map((r) => ({ ...r, tags: r.tags ?? "" })), total };
}

// rating="any" なら3モード横断で返す（お気に入り一覧はモードを問わず全部出す）
export function postsByIds(ids: number[], rating: Rating | "any" = "all"): PostRow[] {
  if (ids.length === 0) return [];
  const ph = ids.map(() => "?").join(",");
  const ratingCond = rating === "any" ? "" : "AND p.rating = ?";
  const args = rating === "any" ? ids : [rating, ...ids];
  const rows = db
    .prepare(
      `SELECT p.*,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT GROUP_CONCAT(s.name, ',') FROM post_students ps
          JOIN students s ON s.id = ps.student_id WHERE ps.post_id = p.id) AS tags
      FROM posts p WHERE p.status = 'approved' ${ratingCond} AND p.id IN (${ph})
        AND ${PUBLISHED}
      ORDER BY p.created_at DESC`
    )
    .all(...args) as PostRow[];
  return rows.map((r) => ({ ...r, tags: r.tags ?? "" }));
}

export function countNewSince(names: string[], since: number, rating: Rating = "all"): number {
  if (names.length === 0) return 0;
  const ph = names.map(() => "?").join(",");
  return (
    db
      .prepare(
        `SELECT COUNT(DISTINCT p.id) AS c FROM posts p
         JOIN post_students ps ON ps.post_id = p.id
         JOIN students s ON s.id = ps.student_id
         WHERE p.status = 'approved' AND p.rating = ? AND p.auto_tagged = 0
           AND p.created_at > ? AND s.name IN (${ph})`
      // タグで結合しているため、タグ未設定の投稿はもともと数えられない
      )
      .get(rating, since, ...names) as { c: number }
  ).c;
}

export function allStudents(): { id: number; name: string; school: string; aliases: string }[] {
  return db
    .prepare("SELECT id, name, school, aliases FROM students ORDER BY name")
    .all() as { id: number; name: string; school: string; aliases: string }[];
}

export function studentEntries(): StudentEntry[] {
  return allStudents().map((s) => ({
    name: s.name,
    aliases: s.aliases ? s.aliases.split(",").map((a) => a.trim()).filter(Boolean) : [],
  }));
}

export function allSchools(): string[] {
  // 「その他」は常に一番下（(name='その他')は該当時1・それ以外0なので昇順で末尾）
  return (
    db
      .prepare("SELECT name FROM schools ORDER BY (name = 'その他'), sort_order, id")
      .all() as { name: string }[]
  ).map((s) => s.name);
}

// キャラタグ（生徒）を削除。付いていたタグ付けも解除する
export function deleteStudent(name: string): boolean {
  const row = db.prepare("SELECT id FROM students WHERE name = ?").get(name) as
    | { id: number }
    | undefined;
  if (!row) return false;
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM post_students WHERE student_id = ?").run(row.id);
    db.prepare("DELETE FROM students WHERE id = ?").run(row.id);
  });
  tx();
  return true;
}

export function studentsGrouped(rating: Rating = "all"): { school: string; students: { name: string; count: number }[] }[] {
  const rows = db
    .prepare(
      `SELECT s.name, s.school,
        (SELECT COUNT(*) FROM post_students ps
         JOIN posts p ON p.id = ps.post_id
         WHERE ps.student_id = s.id AND p.status = 'approved' AND p.rating = ?
           AND p.auto_tagged = 0) AS count
       FROM students s ORDER BY count DESC, s.name`
    )
    .all(rating) as { name: string; school: string; count: number }[];
  const schools = allSchools();
  // マスタにない陣営名の生徒は「その他」へまとめる
  const known = new Set(schools);
  return schools
    .map((school) => ({
      school,
      students: rows
        .filter((r) => r.school === school || (school === "その他" && !known.has(r.school)))
        .map(({ name, count }) => ({ name, count })),
    }))
    .filter((g) => g.students.length > 0);
}

export function popularTags(limit: number, rating: Rating = "all"): { name: string; count: number }[] {
  return db
    .prepare(
      `SELECT s.name, COUNT(*) AS count FROM post_students ps
       JOIN students s ON s.id = ps.student_id
       JOIN posts p ON p.id = ps.post_id
       WHERE p.status = 'approved' AND p.rating = ? AND p.auto_tagged = 0
       GROUP BY s.id ORDER BY count DESC LIMIT ?`
    )
    .all(rating, limit) as { name: string; count: number }[];
}

// 投稿のタグを置き換える。auto=true なら自動タグ付け(未確認)としてマーク、
// 省略時(管理人の手動保存)は確認済みとして auto_tagged を0に戻す
export function setPostTags(postId: number, names: string[], opts?: { auto?: boolean }) {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM post_students WHERE post_id = ?").run(postId);
    const findOrCreate = db.prepare("INSERT OR IGNORE INTO students(name) VALUES (?)");
    const getId = db.prepare("SELECT id FROM students WHERE name = ?");
    const link = db.prepare(
      "INSERT OR IGNORE INTO post_students(post_id, student_id) VALUES (?, ?)"
    );
    for (const raw of names) {
      const name = raw.trim();
      if (!name) continue;
      findOrCreate.run(name);
      const s = getId.get(name) as { id: number };
      link.run(postId, s.id);
    }
    db.prepare("UPDATE posts SET auto_tagged = ? WHERE id = ?").run(opts?.auto ? 1 : 0, postId);
  });
  tx();
}

// 複数投稿をまとめて削除（タグ付け・いいねも巻き添えで消す）
export function bulkDeletePosts(postIds: number[]): number {
  const ids = postIds.filter((n) => Number.isInteger(n) && n > 0);
  if (ids.length === 0) return 0;
  const delLinks = db.prepare("DELETE FROM post_students WHERE post_id = ?");
  const delLikes = db.prepare("DELETE FROM likes WHERE post_id = ?");
  const delPost = db.prepare("DELETE FROM posts WHERE id = ?");
  const tx = db.transaction(() => {
    for (const id of ids) {
      delLinks.run(id);
      delLikes.run(id);
      delPost.run(id);
    }
  });
  tx();
  return ids.length;
}

// 複数投稿に同じタグ群を「追加」する（既存タグは残す）。管理人の一括操作なので確認済み扱い。
export function bulkAddTags(postIds: number[], names: string[]): number {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (postIds.length === 0 || clean.length === 0) return 0;
  const findOrCreate = db.prepare("INSERT OR IGNORE INTO students(name) VALUES (?)");
  const getId = db.prepare("SELECT id FROM students WHERE name = ?");
  const link = db.prepare(
    "INSERT OR IGNORE INTO post_students(post_id, student_id) VALUES (?, ?)"
  );
  const clearAuto = db.prepare("UPDATE posts SET auto_tagged = 0 WHERE id = ?");
  const tx = db.transaction(() => {
    const ids = clean.map((name) => {
      findOrCreate.run(name);
      return (getId.get(name) as { id: number }).id;
    });
    for (const postId of postIds) {
      for (const sid of ids) link.run(postId, sid);
      clearAuto.run(postId);
    }
  });
  tx();
  return postIds.length;
}

// 自動タグの内容をそのまま承認して公開する（タグは変更せず未確認フラグだけ外す）
export function approvePosts(postIds: number[]): number {
  const ids = postIds.filter((n) => Number.isInteger(n) && n > 0);
  if (ids.length === 0) return 0;
  const upd = db.prepare("UPDATE posts SET auto_tagged = 0 WHERE id = ?");
  const tx = db.transaction(() => {
    for (const id of ids) upd.run(id);
  });
  tx();
  return ids.length;
}

// 関連タグ: 指定キャラと同じ投稿に付いているキャラを共起回数順に返す
export function relatedTags(
  name: string,
  rating: Rating = "all",
  limit = 8
): { name: string; count: number }[] {
  return db
    .prepare(
      `SELECT s2.name, COUNT(*) AS count
       FROM students s1
       JOIN post_students ps1 ON ps1.student_id = s1.id
       JOIN post_students ps2 ON ps2.post_id = ps1.post_id AND ps2.student_id != s1.id
       JOIN students s2 ON s2.id = ps2.student_id
       JOIN posts p ON p.id = ps1.post_id
       WHERE s1.name = ? AND p.status = 'approved' AND p.rating = ? AND p.auto_tagged = 0
       GROUP BY s2.id ORDER BY count DESC, s2.name LIMIT ?`
    )
    .all(name, rating, limit) as { name: string; count: number }[];
}

// 週間ランキング: 直近N日間についた「いいね」数で全投稿をランク付け
export function weeklyRanking(rating: Rating, days: number, limit: number): PostRow[] {
  const rows = db
    .prepare(
      `SELECT p.*,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id
          AND l.created_at > unixepoch() - @window) AS recent_likes,
        (SELECT GROUP_CONCAT(s.name, ',') FROM post_students ps
          JOIN students s ON s.id = ps.student_id WHERE ps.post_id = p.id) AS tags
      FROM posts p
      WHERE p.status = 'approved' AND p.rating = @rating AND ${PUBLISHED}
      ORDER BY recent_likes DESC, like_count DESC, p.created_at DESC
      LIMIT @limit`
    )
    .all({ rating, window: days * 86400, limit }) as PostRow[];
  return rows.map((r) => ({ ...r, tags: r.tags ?? "" }));
}

// 月間アーカイブ: その月に投稿された作品を総いいね数順に
export function monthlyArchive(
  rating: Rating,
  startUnix: number,
  endUnix: number,
  limit: number
): PostRow[] {
  const rows = db
    .prepare(
      `SELECT p.*,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT GROUP_CONCAT(s.name, ',') FROM post_students ps
          JOIN students s ON s.id = ps.student_id WHERE ps.post_id = p.id) AS tags
      FROM posts p
      WHERE p.status = 'approved' AND p.rating = @rating
        AND p.posted_at >= @start AND p.posted_at < @end
        AND ${PUBLISHED}
      ORDER BY like_count DESC, p.created_at DESC
      LIMIT @limit`
    )
    .all({ rating, start: startUnix, end: endUnix, limit }) as PostRow[];
  return rows.map((r) => ({ ...r, tags: r.tags ?? "" }));
}

// 投稿がある月の一覧（アーカイブのナビ用、新しい順）
export function monthsWithPosts(rating: Rating): string[] {
  return (
    db
      .prepare(
        `SELECT DISTINCT strftime('%Y-%m', p.posted_at, 'unixepoch') AS m
         FROM posts p
         WHERE p.status = 'approved' AND p.rating = ?
           AND ${PUBLISHED}
         ORDER BY m DESC`
      )
      .all(rating) as { m: string }[]
  ).map((r) => r.m);
}

// 絵師情報（表示名と公開投稿数）
export function authorInfo(
  screenName: string,
  rating: Rating
): { author_name: string; screen_name: string; count: number } | null {
  const row = db
    .prepare(
      `SELECT author_name, screen_name, COUNT(*) AS count FROM posts p
       WHERE p.screen_name = ? COLLATE NOCASE AND p.status = 'approved' AND p.rating = ?
         AND ${PUBLISHED}
       GROUP BY p.screen_name`
    )
    .get(screenName, rating) as { author_name: string; screen_name: string; count: number } | undefined;
  return row ?? null;
}

// タグページ用: その生徒をよく描いている絵師TOP N
export function topArtistsForTag(
  name: string,
  rating: Rating = "all",
  limit = 5
): { screen_name: string; author_name: string; count: number }[] {
  return db
    .prepare(
      `SELECT p.screen_name, MAX(p.author_name) AS author_name, COUNT(*) AS count
       FROM posts p
       JOIN post_students ps ON ps.post_id = p.id
       JOIN students s ON s.id = ps.student_id
       WHERE s.name = ? AND p.status = 'approved' AND p.rating = ? AND p.screen_name != ''
         AND p.auto_tagged = 0
       GROUP BY p.screen_name COLLATE NOCASE
       ORDER BY count DESC, p.screen_name LIMIT ?`
    )
    .all(name, rating, limit) as { screen_name: string; author_name: string; count: number }[];
}

// --- sitemap用（クローラにはCookieがないので公開側=健全版のみ列挙する） ---

// 健全版に1件以上公開投稿があるタグと、その最終登録時刻
export function sitemapTags(): { name: string; last: number }[] {
  return db
    .prepare(
      `SELECT s.name, MAX(p.created_at) AS last
       FROM students s
       JOIN post_students ps ON ps.student_id = s.id
       JOIN posts p ON p.id = ps.post_id
       WHERE p.status = 'approved' AND p.rating = 'all' AND p.auto_tagged = 0
       GROUP BY s.id`
    )
    .all() as { name: string; last: number }[];
}

// 健全版に公開投稿がある絵師と、その最終登録時刻
export function sitemapArtists(): { screen_name: string; last: number }[] {
  return db
    .prepare(
      `SELECT p.screen_name, MAX(p.created_at) AS last
       FROM posts p
       WHERE p.status = 'approved' AND p.rating = 'all' AND p.screen_name != ''
         AND ${PUBLISHED}
       GROUP BY p.screen_name COLLATE NOCASE`
    )
    .all() as { screen_name: string; last: number }[];
}

// --- サイト設定（管理画面から編集する可変テキスト） ---

// 管理人の一言（ヘッダー直下に表示）。空文字なら非表示
export const NOTICE_KEY = "admin_notice";
export const NOTICE_MAX = 200;

export function getSetting(key: string): string {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? "";
}

export function setSetting(key: string, value: string) {
  db.prepare(
    `INSERT INTO settings(key, value, updated_at) VALUES (?, ?, unixepoch())
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, value);
}

// --- 削除依頼 ---
export function addRemovalRequest(url: string, reason: string, contact: string) {
  db.prepare("INSERT INTO removal_requests(url, reason, contact) VALUES (?, ?, ?)").run(
    url, reason, contact
  );
}
export function listRemovalRequests() {
  return db
    .prepare("SELECT * FROM removal_requests ORDER BY resolved ASC, created_at DESC LIMIT 100")
    .all() as { id: number; url: string; reason: string; contact: string; created_at: number; resolved: number }[];
}
export function resolveRemovalRequest(id: number) {
  db.prepare("UPDATE removal_requests SET resolved = 1 WHERE id = ?").run(id);
}
