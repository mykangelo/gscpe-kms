import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getEnrollment, getSite, saveJson } from "@/lib/repo";

const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return deny();
  return NextResponse.json({ site: await getSite(), enrollment: await getEnrollment() });
}
export async function POST(req: Request) {
  if (!(await isAdmin())) return deny();
  const { name, value } = await req.json().catch(() => ({}));
  if (name === "site" && Array.isArray(value?.programs) && value?.contacts && Array.isArray(value.contacts.emails)) await saveJson("site", value);
  else if (name === "enrollment" && Array.isArray(value?.steps) && Array.isArray(value?.sections)) await saveJson("enrollment", value);
  else return NextResponse.json({ error: "Invalid content shape." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
