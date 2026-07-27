import { NextRequest, NextResponse } from "next/server";
import { MODE_COOKIE, parseMode } from "@/lib/mode";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const mode = parseMode(body?.mode);
  const res = NextResponse.json({ ok: true, mode });
  res.cookies.set(MODE_COOKIE, mode, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 86400,
    path: "/",
  });
  return res;
}
