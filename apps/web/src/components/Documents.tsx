"use client";
import { useMemo, useState } from "react";
import type { PublicDoc } from "@/lib/types";

const CATS = ["all", "form", "procedure", "guideline", "policy", "program"];

function Linked({ text }: { text: string }) {
  return <>{text.split(/(https?:\/\/[^\s)]+[^\s).,;])/).map((p, i) => /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener">{p}</a> : p)}</>;
}

function Card({ d }: { d: PublicDoc }) {
  const [sum, setSum] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function summarize() {
    setBusy(true);
    try {
      const r = await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id }) });
      if (!r.ok) throw new Error();
      setSum((await r.json()).summary);
    } catch { setSum("Could not reach the server. Please try again in a moment."); }
    setBusy(false);
  }
  const download = () => {
    const a = document.createElement("a");
    if (d.file) { a.href = d.file; a.download = ""; }
    else { a.href = URL.createObjectURL(new Blob([d.title + "\n\n" + d.text], { type: "text/plain" })); a.download = d.title.replace(/[^\w]+/g, "-") + ".txt"; }
    document.body.append(a); a.click(); a.remove();
  };
  return (
    <div className="dc">
      <span className="tg">{d.category}</span>
      <h3>{d.title}</h3>
      <p>{d.description || d.text.slice(0, 110) + "…"}</p>
      <div className="bt">
        <button onClick={summarize} disabled={busy}>{busy ? "Summarizing…" : "✨ Summarize"}</button>
        <button className="pr" onClick={download}>Download</button>
      </div>
      {sum && <div className="sm"><button type="button" className="x" aria-label="Hide summary" title="Hide summary" onClick={() => setSum(null)}>×</button><b>AI summary</b><br /><Linked text={sum} /></div>}
    </div>
  );
}

export default function Documents({ docs }: { docs: PublicDoc[] }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => docs.filter((d) => (cat === "all" || d.category === cat) && (d.title + " " + d.description + " " + d.text).toLowerCase().includes(q.toLowerCase())), [docs, cat, q]);
  return (
    <>
      <div className="tl">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents" aria-label="Search documents" />
        <div className="cats">{CATS.map((c) => <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}</button>)}</div>
      </div>
      <p className="cnt">{list.length} {list.length === 1 ? "document" : "documents"} found</p>
      <div className="dg">{list.map((d) => <Card key={d.id} d={d} />)}</div>
    </>
  );
}
