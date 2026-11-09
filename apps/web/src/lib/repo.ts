import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { Doc, Enrollment, PublicDoc, Site } from "./types";

/**
 * Data layer. Today it reads/writes flat files under apps/web/content (same
 * records GRADKnow used). Every function here maps 1:1 to a table in
 * supabase/migrations, so swapping to Supabase only touches this file.
 */
const ROOT = path.join(process.cwd(), "content");
const KB = path.join(ROOT, "knowledge");
export const FILES_DIR = path.join(process.cwd(), "public", "files");
const DATA = path.join(ROOT, "data");
const LOGS = path.join(ROOT, "logs");

let version = Date.now();
export const getVersion = () => version;
export const bump = () => (version = Math.max(Date.now(), version + 1));

export const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "doc";

function parse(id: string, raw: string): Doc {
  const meta: Record<string, string> = {};
  let body = raw;
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (m) {
    for (const l of m[1].split("\n")) {
      const i = l.indexOf(":");
      if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
    }
    body = m[2];
  }
  return {
    id,
    title: meta.title || id,
    category: meta.category || "guideline",
    description: meta.description || "",
    file: meta.file || "",
    summary: meta.summary || "",
    text: body.trim(),
  };
}

const one = (s: string) => s.replace(/\s+/g, " ").trim();

export async function listDocs(): Promise<Doc[]> {
  const names = (await fs.readdir(KB).catch(() => [])).filter((n) => n.endsWith(".md")).sort();
  return Promise.all(names.map(async (n) => parse(n.slice(0, -3), await fs.readFile(path.join(KB, n), "utf8"))));
}

export const readable = (t: string) =>
  t.split("\n").filter((l) => !/^\s*SAMPLE TEMPLATE/i.test(l)).join("\n").trim();

export async function listPublicDocs(): Promise<PublicDoc[]> {
  return (await listDocs()).map((d) => ({ ...d, file: d.file ? "/files/" + d.file : null, text: readable(d.text).slice(0, 6000) }));
}

export async function saveDoc(d: Partial<Doc> & { title: string; text: string }): Promise<Doc> {
  const id = d.id || slug(d.title);
  const rec: Doc = {
    id, title: one(d.title).slice(0, 200), category: d.category || "guideline",
    description: one(d.description || ""), file: d.file || "", summary: one(d.summary || ""), text: d.text.trim(),
  };
  const fm = `---\ntitle: ${rec.title}\ncategory: ${rec.category}\ndescription: ${rec.description}\nfile: ${rec.file}\nsummary: ${rec.summary}\n---\n`;
  await fs.mkdir(KB, { recursive: true });
  await fs.writeFile(path.join(KB, id + ".md"), fm + rec.text + "\n", "utf8");
  bump();
  return rec;
}

export async function deleteDoc(id: string) {
  if (!/^[a-z0-9-]+$/.test(id)) return;
  await fs.rm(path.join(KB, id + ".md"), { force: true });
  bump();
}

const EMPTY_SITE: Site = { contacts: { chair: "", emails: [], phone: "", facebook: "" }, programs: [] };
const EMPTY_ENROLL: Enrollment = { intro: "", link: { label: "", url: "" }, steps: [], sections: [] };

export async function getSite(): Promise<Site> {
  try { return { ...EMPTY_SITE, ...JSON.parse(await fs.readFile(path.join(DATA, "site.json"), "utf8")) }; } catch { return EMPTY_SITE; }
}
export async function getEnrollment(): Promise<Enrollment> {
  try { return { ...EMPTY_ENROLL, ...JSON.parse(await fs.readFile(path.join(DATA, "enrollment.json"), "utf8")) }; } catch { return EMPTY_ENROLL; }
}
export async function saveJson(name: "site" | "enrollment", value: unknown) {
  await fs.mkdir(DATA, { recursive: true });
  await fs.writeFile(path.join(DATA, name + ".json"), JSON.stringify(value, null, 2), "utf8");
  bump();
}

export async function logQuestion(q: string, hit: boolean) {
  await fs.mkdir(LOGS, { recursive: true });
  await fs.appendFile(path.join(LOGS, "questions.jsonl"), JSON.stringify({ t: Math.floor(Date.now() / 1000), q, hit }) + "\n", "utf8");
}
export async function readQuestions(limit = 50): Promise<{ t: number; q: string; hit: boolean }[]> {
  try {
    const lines = (await fs.readFile(path.join(LOGS, "questions.jsonl"), "utf8")).trim().split("\n").filter(Boolean);
    return lines.slice(-limit).reverse().map((l) => JSON.parse(l));
  } catch { return []; }
}
