import { NextResponse } from "next/server";
import { answer } from "@/lib/retrieval";
import { logQuestion } from "@/lib/repo";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const q = String(body?.message || "").trim().slice(0, 1000);
  if (!q) return NextResponse.json({ error: "empty" }, { status: 400 });
  const r = await answer(q);
  await logQuestion(q, r.hit).catch(() => {});
  return NextResponse.json({ answer: r.answer, sources: r.sources });
}
