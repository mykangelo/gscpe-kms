import Documents from "@/components/Documents";
import { listPublicDocs } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documents | GRADKnow" };

export default async function Page() {
  return (
    <section className="panel on"><div className="w">
      <h2>Documents</h2>
      <p className="intro">Download forms and templates, procedures and guidelines. Use Summarize for a quick AI overview.</p>
      <Documents docs={await listPublicDocs()} />
    </div></section>
  );
}
