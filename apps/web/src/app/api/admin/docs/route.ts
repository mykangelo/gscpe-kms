import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { FILES_DIR, deleteDoc, listDocs, saveDoc, slug } from "@/lib/repo";
import { CATEGORIES } from "@/lib/types";

const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const ALLOWED = [".docx", ".doc", ".pdf", ".xlsx", ".xls", ".pptx", ".txt", ".md"];

export async function GET() {
  if (!(await isAdmin())) return deny();
  return NextResponse.json(await listDocs());
}

/** multipart: title, category, description, summary, text, file? (same title replaces the old version) */
export async function POST(req: Request) {
  if (!(await isAdmin())) return deny();
  const f = await req.formData();
  const title = String(f.get("title") || "").trim();
  let text = String(f.get("text") || "");
  const category = CATEGORIES.includes(String(f.get("category")) as never) ? String(f.get("category")) : "guideline";
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const id = slug(title);
  let file = (await listDocs()).find((d) => d.id === id)?.file || "";
  const up = f.get("file");
  if (up instanceof File && up.size) {
    const ext = path.extname(up.name).toLowerCase();
    if (!ALLOWED.includes(ext)) return NextResponse.json({ error: "File type not allowed." }, { status: 400 });
    file = id + ext;
    const buf = Buffer.from(await up.arrayBuffer());
    await fs.mkdir(FILES_DIR, { recursive: true });
    await fs.writeFile(path.join(FILES_DIR, file), buf);
    // PDF/DOCX/XLSX/PPTX text extraction belongs to services/ingest (planned); .txt/.md are read here.
    if ((ext === ".txt" || ext === ".md") && !text.trim()) text = buf.toString("utf8");
  }
  if (!text.trim()) return NextResponse.json({ error: "Paste the document text so the AI can read it (PDF/DOCX extraction arrives with services/ingest)." }, { status: 400 });
  const d = await saveDoc({ id, title, category, description: String(f.get("description") || ""), summary: String(f.get("summary") || ""), file, text });
  return NextResponse.json(d);
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return deny();
  await deleteDoc(new URL(req.url).searchParams.get("id") || "");
  return NextResponse.json({ ok: true });
}
