import { NextResponse } from "next/server";
import { COOKIE, adminEnabled, checkPassword, makeToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ error: "Set ADMIN_PASSWORD in apps/web/.env.local first." }, { status: 503 });
  const pw = String((await req.json().catch(() => ({})))?.password || "");
  if (!checkPassword(pw)) return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 3600 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
