// メモリ内の簡易レートリミッタ（本番でプロセスが複数になる場合はRedis等に置き換え）
import type { NextRequest } from "next/server";

const buckets = new Map<string, number[]>();

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

// 許可なら true。windowSec 内に limit 回まで。
export function allow(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    buckets.set(key, arr);
    return false;
  }
  arr.push(now);
  buckets.set(key, arr);
  if (buckets.size > 10000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return true;
}
