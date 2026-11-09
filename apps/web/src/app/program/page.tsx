import ProgramView from "@/components/ProgramView";
import { getSite } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Program | GRADKnow" };

export default async function Page() {
  const { programs } = await getSite();
  return (
    <section className="panel on"><div className="w">
      <h2>Programs</h2>
      <p className="intro">Computer Engineering at the PUP Graduate School, Sta. Mesa, Manila.</p>
      <ProgramView programs={programs} />
    </div></section>
  );
}
