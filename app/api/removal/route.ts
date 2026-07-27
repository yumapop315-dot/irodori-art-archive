import { NextRequest, NextResponse } from "next/server";
import { addRemovalRequest } from "@/lib/db";
import { allow, clientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  if (!allow(`removal:${clientIp(req)}`, 3, 3600)) {
    return NextResponse.json({ error: "送信が多すぎます。時間をおいてください" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const url = String(body?.url ?? "").slice(0, 500);
  const reason = String(body?.reason ?? "").slice(0, 2000);
  const contact = String(body?.contact ?? "").slice(0, 300);
  if (!url || !reason) {
    return NextResponse.json({ error: "URLと理由を入力してください" }, { status: 400 });
  }
  addRemovalRequest(url, reason, contact);
  return NextResponse.json({ ok: true });
}
