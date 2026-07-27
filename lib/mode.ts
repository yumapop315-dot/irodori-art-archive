import { cookies } from "next/headers";
import type { Rating } from "./db";

export const MODE_COOKIE = "site_mode";

export function parseMode(value: string | undefined): Rating {
  return value === "r18" || value === "sensitive" ? value : "all";
}

// 現在の表示モード（健全版 'all' / きわどい版 'sensitive' / R18版 'r18'）
export async function getMode(): Promise<Rating> {
  const store = await cookies();
  return parseMode(store.get(MODE_COOKIE)?.value);
}
