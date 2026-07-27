import crypto from "crypto";
import { cookies } from "next/headers";

const KEY = process.env.ADMIN_KEY || "change-me";
export const ADMIN_COOKIE = "admin_session";

function sign(expiry: number): string {
  const mac = crypto.createHmac("sha256", KEY).update(String(expiry)).digest("hex");
  return `${expiry}.${mac}`;
}

export function createSessionToken(days = 7): string {
  return sign(Date.now() + days * 86400 * 1000);
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expStr, mac] = token.split(".");
  const expiry = Number(expStr);
  if (!expiry || expiry < Date.now() || !mac) return false;
  const expected = sign(expiry).split(".")[1];
  try {
    return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
