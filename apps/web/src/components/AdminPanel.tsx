"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type Doc, type Enrollment, type Group, type Program, type Site } from "@/lib/types";

type Stats = { documents: number; chunks: number; ai: boolean; questions: { t: number; q: string; hit: boolean }[] };
const TABS = ["Dashboard", "Documents", "Site content", "Questions"] as const;

export default function AdminPanel({ enabled, authed }: { enabled: boolean; authed: boolean }) {
  const router = useRouter();
  const [ok, setOk] = useState(authed);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Dashboard");
  const [msg, setMsg] = useState<{ t: string; err?: boolean } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [site, setSite] = useState<Site | null>(null);
  const [enr, setEnr] = useState<Enrollment | null>(null);

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([fetch("/api/admin/stats"), fetch("/api/admin/docs"), fetch("/api/admin/content")]);
    if (a.status === 401) { setOk(false); return; }
    setStats(await a.json()); setDocs(await b.json());
    const j: { site: Site; enrollment: Enrollment } = await c.json();
    setSite(j.site); setEnr(j.enrollment);
  }, []);
  useEffect(() => {
    if (!ok) return;
    let cancelled = false;
    void (async () => {
      const [a, b, c] = await Promise.all([fetch("/api/admin/stats"), fetch("/api/admin/docs"), fetch("/api/admin/content")]);
      if (cancelled) return;
      if (a.status === 401) { setOk(false); return; }
      setStats(await a.json()); setDocs(await b.json());
      const j: { site: Site; enrollment: Enrollment } = await c.json();
      if (cancelled) return;
      setSite(j.site); setEnr(j.enrollment);
    })();
    return () => { cancelled = true; };
  }, [ok]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: new FormData(e.currentTarget).get("password") }) });
    if (r.ok) { setMsg(null); setOk(true); } else setMsg({ t: (await r.json()).error, err: true });
  }
  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); setOk(false); }
  async function saveDoc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget, r = await fetch("/api/admin/docs", { method: "POST", body: new FormData(form) });
    const j = await r.json();
    if (r.ok) { setMsg({ t: `Saved “${j.title}”. The AI and Documents page are updated.` }); form.reset(); load(); router.refresh(); } else setMsg({ t: j.error, err: true });
  }
  async function del(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch("/api/admin/docs?id=" + id, { method: "DELETE" }); load(); router.refresh();
  }
  async function saveContent(name: "site" | "enrollment", value: Site | Enrollment) {
    const r = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, value }) });
    setMsg(r.ok ? { t: `Saved ${name} content.` } : { t: (await r.json()).error, err: true });
    if (r.ok) { load(); router.refresh(); }
  }

  if (!enabled) return <p className="note">Staff access is off. Set <code>ADMIN_PASSWORD</code> in <code>apps/web/.env.local</code> and restart. (Prototype auth; Supabase Auth roles are on the roadmap.)</p>;
  if (!ok) return (
    <form className="adm gate" onSubmit={login}>
      <label>Staff password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="btn b1">Sign in</button>
      {msg && <p className="er">{msg.t}</p>}
    </form>
  );

  return (
    <div className="adm">
      <div className="sw">
        {TABS.map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => { setTab(t); setMsg(null); }}>{t}</button>)}
        <button onClick={logout}>Sign out</button>
      </div>
      {msg && <p className={msg.err ? "er" : "ok"}>{msg.t}</p>}

      {tab === "Dashboard" && stats && (
        <div className="stats">
          <div><b>{stats.documents}</b>documents</div><div><b>{stats.chunks}</b>searchable chunks</div>
          <div><b>{stats.questions.length}</b>recent questions</div><div><b>{stats.ai ? "On" : "Built-in"}</b>AI engine</div>
        </div>
      )}

      {tab === "Documents" && (
        <>
          <form className="c adm" onSubmit={saveDoc}>
            <h3>Add or replace a document</h3>
            <div className="row">
              <label>Title (same title replaces)<input name="title" required /></label>
              <label>Category<select name="category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            </div>
            <label>Short description<input name="description" /></label>
            <label>Summary (optional, shown when students click Summarize)<input name="summary" /></label>
            <label>Downloadable file (.pdf .docx .xlsx .pptx .txt .md)<input name="file" type="file" /></label>
            <label>Document text for the AI (auto-filled from .txt/.md)<textarea name="text" /></label>
            <button className="btn b1">Save document</button>
          </form>
          <table><thead><tr><th>Title</th><th>Category</th><th>File</th><th /></tr></thead><tbody>
            {docs.map((d) => <tr key={d.id}><td>{d.title}</td><td>{d.category}</td><td>{d.file || "—"}</td><td><button className="btn b2" onClick={() => del(d.id)}>Delete</button></td></tr>)}
          </tbody></table>
        </>
      )}

      {tab === "Site content" && site && enr && (
        <>
          <SiteForm site={site} onChange={setSite} onSave={() => saveContent("site", cleanSite(site))} />
          <EnrollmentForm enr={enr} onChange={setEnr} onSave={() => saveContent("enrollment", cleanEnrollment(enr))} />
        </>
      )}

      {tab === "Questions" && stats && (
        <table><thead><tr><th>When</th><th>Question</th><th>Answered</th></tr></thead><tbody>
          {stats.questions.map((x, i) => <tr key={i}><td>{new Date(x.t * 1000).toLocaleString()}</td><td>{x.q}</td><td>{x.hit ? "Yes" : "No answer: add a document"}</td></tr>)}
        </tbody></table>
      )}
    </div>
  );
}

/* ---------- Site content editors (plain forms, no code) ---------- */
const lines = (v: string) => v.split("\n");
const clean = (a: string[]) => a.map((x) => x.trim()).filter(Boolean);
const move = <T,>(a: T[], i: number, d: number) => { const b = [...a], j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };
const upd = <T,>(a: T[], i: number, patch: Partial<T>) => a.map((x, n) => (n === i ? { ...x, ...patch } : x));
const slugId = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "program";

function cleanSite(s: Site): Site {
  return {
    contacts: { chair: s.contacts.chair.trim(), emails: clean(s.contacts.emails), phone: s.contacts.phone.trim(), facebook: s.contacts.facebook.trim() },
    programs: s.programs.map((p) => ({
      ...p, id: p.id || slugId(p.short || p.name), name: p.name.trim(), short: p.short.trim(), intro: p.intro.trim(),
      specializations: clean(p.specializations),
      groups: p.groups.filter((g) => g.name.trim()).map((g) => ({ name: g.name.trim(), units: Number(g.units) || 0, subjects: clean(g.subjects) })),
    })),
  };
}
function cleanEnrollment(e: Enrollment): Enrollment {
  return {
    intro: e.intro.trim(), link: { label: e.link.label.trim(), url: e.link.url.trim() },
    steps: e.steps.filter((x) => x.title.trim() || x.text.trim()).map((x) => ({ title: x.title.trim(), text: x.text.trim() })),
    sections: e.sections.filter((x) => x.title.trim()).map((x) => ({ title: x.title.trim(), items: clean(x.items), note: x.note.trim() })),
  };
}

function Bar({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (d: number) => void; onRemove: () => void }) {
  return (
    <div className="row" style={{ gridTemplateColumns: "repeat(3, auto)", justifyContent: "end", gap: 8 }}>
      <button type="button" className="btn b2" disabled={i === 0} onClick={() => onMove(-1)}>↑ Up</button>
      <button type="button" className="btn b2" disabled={i === n - 1} onClick={() => onMove(1)}>↓ Down</button>
      <button type="button" className="btn b2" onClick={() => confirm("Remove this?") && onRemove()}>Remove</button>
    </div>
  );
}

function SiteForm({ site, onChange, onSave }: { site: Site; onChange: (s: Site) => void; onSave: () => void }) {
  const c = site.contacts;
  const setC = (patch: Partial<Site["contacts"]>) => onChange({ ...site, contacts: { ...c, ...patch } });
  const setP = (i: number, patch: Partial<Program>) => onChange({ ...site, programs: upd(site.programs, i, patch) });
  const setG = (pi: number, gi: number, patch: Partial<Group>) => setP(pi, { groups: upd(site.programs[pi].groups, gi, patch) });
  return (
    <div className="c adm">
      <h3>Contacts</h3>
      <div className="row">
        <label>Program Chair<input value={c.chair} onChange={(e) => setC({ chair: e.target.value })} /></label>
        <label>Phone<input value={c.phone} onChange={(e) => setC({ phone: e.target.value })} /></label>
        <label>Facebook page link<input value={c.facebook} onChange={(e) => setC({ facebook: e.target.value })} /></label>
      </div>
      <label>Email addresses (one per line)
        <textarea value={c.emails.join("\n")} onChange={(e) => setC({ emails: lines(e.target.value) })} style={{ minHeight: 70 }} />
      </label>

      <h3>Programs</h3>
      {site.programs.map((p, pi) => (
        <div key={pi} className="c adm t">
          <Bar i={pi} n={site.programs.length} onMove={(d) => onChange({ ...site, programs: move(site.programs, pi, d) })} onRemove={() => onChange({ ...site, programs: site.programs.filter((_, n) => n !== pi) })} />
          <div className="row">
            <label>Program name<input value={p.name} onChange={(e) => setP(pi, { name: e.target.value })} /></label>
            <label>Short name (e.g. MS CpE)<input value={p.short} onChange={(e) => setP(pi, { short: e.target.value })} /></label>
          </div>
          <label>Description<textarea value={p.intro} onChange={(e) => setP(pi, { intro: e.target.value })} style={{ minHeight: 90 }} /></label>
          <label>Specializations (one per line)
            <textarea value={p.specializations.join("\n")} onChange={(e) => setP(pi, { specializations: lines(e.target.value) })} style={{ minHeight: 90 }} />
          </label>
          <h3>Curriculum groups</h3>
          {p.groups.map((g, gi) => (
            <div key={gi} className="adm" style={{ borderLeft: "2px solid var(--line)", paddingLeft: 14 }}>
              <div className="row">
                <label>Group name (e.g. Core, Major)<input value={g.name} onChange={(e) => setG(pi, gi, { name: e.target.value })} /></label>
                <label>Units<input type="number" min={0} value={g.units} onChange={(e) => setG(pi, gi, { units: Number(e.target.value) })} /></label>
              </div>
              <label>Subjects (one per line)
                <textarea value={g.subjects.join("\n")} onChange={(e) => setG(pi, gi, { subjects: lines(e.target.value) })} style={{ minHeight: 110 }} />
              </label>
              <Bar i={gi} n={p.groups.length} onMove={(d) => setP(pi, { groups: move(p.groups, gi, d) })} onRemove={() => setP(pi, { groups: p.groups.filter((_, n) => n !== gi) })} />
            </div>
          ))}
          <button type="button" className="btn b2" onClick={() => setP(pi, { groups: [...p.groups, { name: "", units: 0, subjects: [] }] })}>+ Add curriculum group</button>
        </div>
      ))}
      <button type="button" className="btn b2" onClick={() => onChange({ ...site, programs: [...site.programs, { id: "", name: "", short: "", intro: "", specializations: [], groups: [] }] })}>+ Add program</button>
      <button type="button" className="btn b1" onClick={onSave}>Save site content</button>
    </div>
  );
}

function EnrollmentForm({ enr, onChange, onSave }: { enr: Enrollment; onChange: (e: Enrollment) => void; onSave: () => void }) {
  return (
    <div className="c adm">
      <h3>Enrollment guide</h3>
      <label>Introduction<textarea value={enr.intro} onChange={(e) => onChange({ ...enr, intro: e.target.value })} style={{ minHeight: 90 }} /></label>
      <div className="row">
        <label>Apply button text<input value={enr.link.label} onChange={(e) => onChange({ ...enr, link: { ...enr.link, label: e.target.value } })} /></label>
        <label>Apply link (URL)<input value={enr.link.url} onChange={(e) => onChange({ ...enr, link: { ...enr.link, url: e.target.value } })} /></label>
      </div>

      <h3>Steps</h3>
      {enr.steps.map((st, i) => (
        <div key={i} className="adm" style={{ borderLeft: "2px solid var(--line)", paddingLeft: 14 }}>
          <label>Step {i + 1} title<input value={st.title} onChange={(e) => onChange({ ...enr, steps: upd(enr.steps, i, { title: e.target.value }) })} /></label>
          <label>Details<textarea value={st.text} onChange={(e) => onChange({ ...enr, steps: upd(enr.steps, i, { text: e.target.value }) })} style={{ minHeight: 80 }} /></label>
          <Bar i={i} n={enr.steps.length} onMove={(d) => onChange({ ...enr, steps: move(enr.steps, i, d) })} onRemove={() => onChange({ ...enr, steps: enr.steps.filter((_, n) => n !== i) })} />
        </div>
      ))}
      <button type="button" className="btn b2" onClick={() => onChange({ ...enr, steps: [...enr.steps, { title: "", text: "" }] })}>+ Add step</button>

      <h3>Information sections</h3>
      {enr.sections.map((sec, i) => (
        <div key={i} className="adm" style={{ borderLeft: "2px solid var(--line)", paddingLeft: 14 }}>
          <label>Section title<input value={sec.title} onChange={(e) => onChange({ ...enr, sections: upd(enr.sections, i, { title: e.target.value }) })} /></label>
          <label>Items (one per line)
            <textarea value={sec.items.join("\n")} onChange={(e) => onChange({ ...enr, sections: upd(enr.sections, i, { items: lines(e.target.value) }) })} style={{ minHeight: 120 }} />
          </label>
          <label>Note (optional)<input value={sec.note} onChange={(e) => onChange({ ...enr, sections: upd(enr.sections, i, { note: e.target.value }) })} /></label>
          <Bar i={i} n={enr.sections.length} onMove={(d) => onChange({ ...enr, sections: move(enr.sections, i, d) })} onRemove={() => onChange({ ...enr, sections: enr.sections.filter((_, n) => n !== i) })} />
        </div>
      ))}
      <button type="button" className="btn b2" onClick={() => onChange({ ...enr, sections: [...enr.sections, { title: "", items: [], note: "" }] })}>+ Add section</button>
      <button type="button" className="btn b1" onClick={onSave}>Save enrollment guide</button>
    </div>
  );
}
