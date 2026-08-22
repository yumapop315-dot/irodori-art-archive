"use client";

// ログイン不要のユーザー状態（localStorage）
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return (JSON.parse(localStorage.getItem(key) ?? "null") as T) ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getClientId(): string {
  let id = localStorage.getItem("client_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("client_id", id);
  }
  return id;
}

export const likedPosts = {
  get: () => read<number[]>("liked_posts", []),
  has: (id: number) => read<number[]>("liked_posts", []).includes(id),
  toggle(id: number, liked: boolean) {
    const cur = read<number[]>("liked_posts", []);
    write("liked_posts", liked ? [...new Set([...cur, id])] : cur.filter((x) => x !== id));
  },
};

export const follows = {
  get: () => read<string[]>("followed_students", []),
  has: (name: string) => read<string[]>("followed_students", []).includes(name),
  toggle(name: string): boolean {
    const cur = read<string[]>("followed_students", []);
    const next = cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name];
    write("followed_students", next);
    return next.includes(name);
  },
};

export const mutes = {
  get: () => read<string[]>("muted_authors", []),
  add(screenName: string) {
    write("muted_authors", [...new Set([...read<string[]>("muted_authors", []), screenName])]);
  },
  remove(screenName: string) {
    write("muted_authors", read<string[]>("muted_authors", []).filter((x) => x !== screenName));
  },
};
