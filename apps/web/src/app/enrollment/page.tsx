import { getEnrollment } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enrollment | GRADKnow" };

export default async function Page() {
  const e = await getEnrollment();
  return (
    <section className="panel on"><div className="w split">
      <div>
        <h2>Enrollment guide</h2>
        {e.intro && <p className="intro" style={{ margin: "0 0 24px" }}>{e.intro}</p>}
        <ol className="steps">
          {e.steps.length ? e.steps.map((s, i) => <li key={i}><b>{s.title}</b>{s.text}</li>) : <li><b>Steps coming soon</b>Please contact the Program Chair.</li>}
        </ol>
        {e.link.url && e.link.label && <a className="btn b1" href={e.link.url} target="_blank" rel="noopener">{e.link.label}</a>}
      </div>
      <div id="enSec">
        {e.sections.length ? e.sections.map((x, i) => (
          <div className="c" key={i}>
            {x.title && <h3>{x.title}</h3>}
            {!!x.items.length && <ul className="plain">{x.items.map((it, n) => <li key={n}>{it}</li>)}</ul>}
            {x.note && <p className="nt2">{x.note}</p>}
          </div>
        )) : <div className="c"><h3>Requirements</h3><p>Requirements have not been added yet.</p></div>}
      </div>
    </div></section>
  );
}
