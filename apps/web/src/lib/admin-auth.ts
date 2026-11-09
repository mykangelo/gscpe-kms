import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Prototype staff auth: one shared ADMIN_PASSWORD. Replace with Supabase Auth roles (see supabase/migrations). */
export const COOKIE = "gk_admin";
const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

export const adminEnabled = () => !!process.env.ADMIN_PASSWORD;

export function checkPassword(pw: string) {
  const a = Buffer.from(pw), b = Buffer.from(process.env.ADMIN_PASSWORD || "");
  return a.length === b.length && b.length > 0 && timingSafeEqual(a, b);
}
export function makeToken() {
  const exp = String(Date.now() + 8 * 3600_000);
  return `${exp}.${sign(exp)}`;
}
export async function isAdmin() {
  if (!adminEnabled()) return false;
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return false;
  const [exp, sig] = t.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = Buffer.from(sign(exp)), got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got);
}
