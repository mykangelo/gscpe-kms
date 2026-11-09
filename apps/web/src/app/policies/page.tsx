import Link from "next/link";
import { listDocs, readable } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Policies & Guidelines | GRADKnow" };

const linkify = (t: string) => t.split(/(https?:\/\/[^\s)]+[^\s).,;])/).map((p, i) => /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener">{p}</a> : p);

/** The kms "Policies & Guidelines" accordion, fed by official GRADKnow documents. */
export default async function Page() {
  const docs = (await listDocs()).filter((d) => d.category === "policy" || d.category === "guideline");
  return (
    <section className="panel on"><div className="w">
      <h2>Policies &amp; Guidelines</h2>
      <p className="intro">University and Graduate School rules in one place. Open an item for the key text, or go to <Link href="/documents" style={{ color: "var(--teal)" }}>Documents</Link> for the full file and an AI summary.</p>
      <div className="acc">
        {docs.length ? docs.map((d) => {
          const t = readable(d.text);
          return (
            <details key={d.id}>
              <summary>{d.title}</summary>
              <div className="body">
                {d.description && <p style={{ margin: "0 0 10px" }}><b style={{ color: "var(--txt)" }}>{d.description}</b></p>}
                {linkify(t.length > 900 ? t.slice(0, t.lastIndexOf(" ", 900)) + "…" : t)}
                {d.file && <p><a href={"/files/" + d.file} download>Download the full document</a></p>}
              </div>
            </details>
          );
        }) : <p className="note">No policies or guidelines have been added yet.</p>}
      </div>
    </div></section>
  );
}
