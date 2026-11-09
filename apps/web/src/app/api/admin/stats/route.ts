import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getIndex } from "@/lib/retrieval";
import { readQuestions } from "@/lib/repo";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ix = await getIndex();
  return NextResponse.json({
    documents: ix.docs.length, chunks: ix.chunks.length,
    ai: !!(process.env.GRADKNOW_AI_KEY || process.env.ANTHROPIC_API_KEY),
    questions: await readQuestions(),
  });
}
