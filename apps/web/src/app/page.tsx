import Image from "next/image";
import Link from "next/link";
import { MEDS_HTML } from "@/components/meds";

const FEATURES: [string, string, string, string][] = [
  ["", "AI Chat Assistant", "The main way in. Ask in plain language and get answers from official Graduate School content.", "/ask"],
  ["t", "Document Repository", "Stores important and official forms and documents in one place.", "/documents"],
  ["m", "Smart Document Search", "Helps users quickly find the documents or information they need.", "/documents"],
  ["", "Enrollment Guide", "Provides enrollment steps, requirements and other related information.", "/enrollment"],
  ["t", "Policies and Guidelines", "Organizes important university and Graduate School rules in one place.", "/policies"],
  ["m", "Program Information", "Basic information about the Computer Engineering graduate programs (MS CpE and PhD CpE).", "/program"],
  ["", "Document Management", "Lets authorized users upload, update and organize documents.", "/admin"],
];
const STEPS: [string, string][] = [
  ["Collect", "Program details, forms and approved documents go into one repository."],
  ["Organize", "Content is sorted by type, program and student stage."],
  ["Answer", "The AI assistant retrieves from official content and points to the source."],
  ["Maintain", "Authorized staff keep entries current each school year."],
];

export default function Home() {
  return (
    <section className="panel home on">
      <header className="hero"><div className="w">
        <p className="univ">Polytechnic University of the Philippines</p>
        <div className="logos">
          <Image src="/logos/pup-seal.png" alt="PUP seal" width={112} height={112} priority />
          <Image src="/logos/gscpe-seal.png" alt="Graduate School Computer Engineering seal" width={112} height={112} priority />
          <Image src="/logos/pup-gs-seal.png" alt="PUP Graduate School seal" width={112} height={112} priority />
        </div>
        <h1>GRAD<em>Know</em></h1>
        <p className="sub"><i></i>AI-Based GSCpE Knowledge Management System<i></i></p>
        <div className="progs">
          <div><small>Doctor of Philosophy in</small><b>Computer Engineering</b><span>(PhD CpE)</span></div>
          <div><small>Master of Science in</small><b>Computer Engineering</b><span>(MS CpE)</span></div>
        </div>
        <div className="btns"><Link className="btn b1" href="/ask">Ask AI</Link><Link className="btn b2" href="/documents">Search Documents</Link></div>
        <div className="meds" aria-hidden="true" dangerouslySetInnerHTML={{ __html: MEDS_HTML }} />
        <p className="sy"><i></i>SY 2026 – 2027<i></i></p>
      </div></header>

      <div className="fsec"><div className="w">
        <h2>Seven tools, one system</h2>
        <p className="intro">GRADKnow brings the Graduate School’s knowledge together for applicants, students, advisers and staff.</p>
        <div className="fl">{FEATURES.map(([c, t, d, href]) => (
          <Link key={t} href={href} className={"c " + c}><h3>{t}</h3><p>{d}</p></Link>
        ))}</div>
      </div></div>

      <div className="fsec"><div className="w split">
        <div>
          <h2>Knowledge that stays with the program</h2>
          <p className="intro" style={{ margin: 0 }}>Answers about graduate study often sit in Facebook posts, chat threads and individual memory. GRADKnow gathers them into one organized system maintained by the Graduate School of Computer Engineering (GSCpE).</p>
        </div>
        <ol className="steps">{STEPS.map(([t, d]) => <li key={t}><b>{t}</b>{d}</li>)}</ol>
      </div></div>
    </section>
  );
}
