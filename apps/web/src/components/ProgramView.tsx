"use client";
import { useState } from "react";
import type { Program } from "@/lib/types";

export default function ProgramView({ programs }: { programs: Program[] }) {
  const [cur, setCur] = useState(0);
  const p = programs[cur];
  if (!p) return <p className="note">No programs have been added yet.</p>;
  const tot = p.groups.reduce((a, g) => a + (+g.units || 0), 0), n = p.groups.reduce((a, g) => a + g.subjects.length, 0);
  return (
    <>
      <div className="sw">{programs.map((x, i) => <button key={x.id} className={i === cur ? "on" : ""} onClick={() => setCur(i)}>{x.short}</button>)}</div>
      <h2 className="ph">{p.name}</h2>
      <p className="intro">{p.intro}</p>
      <div className="stats">
        {!!tot && <div><b>{tot}</b>total units</div>}
        {!!n && <div><b>{n}</b>subjects</div>}
        <div><b>{p.specializations.length}</b>specializations</div>
      </div>
      <div className="tags">{p.specializations.map((s) => <span key={s}>{s}</span>)}</div>
      {p.groups.length ? (
        <div className="cur">{p.groups.map((g) => (
          <div className="c" key={g.name}><h3>{g.name}{+g.units ? ` · ${g.units} units` : ""}</h3><ul>{g.subjects.map((s) => <li key={s}>{s}</li>)}</ul></div>
        ))}</div>
      ) : <p className="note">The subject list for this program has not been added yet. Please contact the Program Chair.</p>}
    </>
  );
}
