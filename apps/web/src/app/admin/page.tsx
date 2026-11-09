import AdminPanel from "@/components/AdminPanel";
import { adminEnabled, isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff | GRADKnow" };

export default async function Page() {
  return (
    <section className="panel on"><div className="w">
      <h2>Document Management</h2>
      <AdminPanel enabled={adminEnabled()} authed={await isAdmin()} />
    </div></section>
  );
}
