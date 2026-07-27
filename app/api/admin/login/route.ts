import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, createSessionToken } from "@/lib/adminAuth";
import { allow, clientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  if (!allow(`login:${clientIp(req)}`, 10, 600)) {
    return NextResponse.json({ error: "試行が多すぎます" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const password = String(body?.password ?? "");

  if (body?.action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 86400,
    path: "/",
  });
  return res;
}
