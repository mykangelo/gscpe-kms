"use client";
import { type FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Msg = { id: number; text: string; user?: boolean; sources?: string[] };
const CHIPS = ["Admission requirements", "MS CpE curriculum", "PhD CpE", "Tuition", "Enrollment steps", "Contact"];

export default function Ask() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => { document.body.classList.add("chat"); return () => document.body.classList.remove("chat"); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs]);

  async function ask(text: string) {
    text = text.trim();
    if (!text || busy) return;
    setBusy(true); setQ("");
    const id = nextId.current;
    nextId.current += 2;
    setMsgs((m) => [...m, { id, text, user: true }, { id: id + 1, text: "Thinking…" }]);
    let reply: Msg;
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      if (!r.ok) throw new Error();
      const j = await r.json();
      reply = { id: id + 1, text: j.answer, sources: j.sources };
    } catch {
      reply = { id: id + 1, text: "I can’t reach the GRADKnow server right now. Please try again in a moment or contact the Program Chair." };
    }
    setMsgs((m) => m.map((x) => (x.id === id + 1 ? reply : x)));
    setBusy(false);
  }

  return (
    <section className="panel ask on">
      <div className="gpt">
        <div id="log">
          {!msgs.length && (
            <div className="empty">
              <Image src="/logos/gscpe-seal.png" alt="" width={72} height={72} />
              <h2>How can I help you today?</h2>
              <p>Ask about programs, admission, enrollment, fees and documents.</p>
              <div className="chips">{CHIPS.map((c) => <button key={c} onClick={() => ask(c)}>{c}</button>)}</div>
            </div>
          )}
          {msgs.map((m) => (
            <div key={m.id} className={m.user ? "m1" : "m2"}>
              {m.text}
              {!!m.sources?.length && <div className="src">Sources: {m.sources.join(" · ")}</div>}
            </div>
          ))}
          <div ref={end} />
        </div>
        <form className="gf" onSubmit={(e: FormEvent) => { e.preventDefault(); ask(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Message GRADKnow" aria-label="Your question" autoComplete="off" />
          <button aria-label="Send" disabled={busy}>↑</button>
        </form>
        <p className="gn">GRADKnow answers from official GSCpE content. Confirm important details with the Program Chair.</p>
      </div>
    </section>
  );
}
