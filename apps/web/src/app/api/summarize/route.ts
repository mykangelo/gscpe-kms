import { NextResponse } from "next/server";
import { summarize } from "@/lib/retrieval";

export async function POST(req: Request) {
  const id = String((await req.json().catch(() => ({})))?.id || "");
  const s = await summarize(id);
  return s ? NextResponse.json({ summary: s }) : NextResponse.json({ error: "not found" }, { status: 404 });
}
