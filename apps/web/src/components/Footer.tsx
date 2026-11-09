import Link from "next/link";
import { getSite } from "@/lib/repo";

export default async function Footer() {
  const { contacts: c } = await getSite();
  const rows: [string, string][] = [["Program Chair: ", c.chair], ...c.emails.map((m, i): [string, string] => [i ? "" : "Email: ", m]), ["Phone: ", c.phone]];
  const ext = { target: "_blank", rel: "noopener" } as const;
  return (
    <footer className="site-footer">
      <div className="w">
        <div className="fg">
          <div><h4>QUICK LINKS</h4><ul>
            {[["/", "Home"], ["/ask", "Ask AI"], ["/documents", "Documents"], ["/enrollment", "Enrollment"], ["/policies", "Policies"], ["/program", "Program"], ["/admin", "Staff access"]].map(([h, l]) => <li key={h}><Link href={h}>{l}</Link></li>)}
          </ul></div>
          <div><h4>ONLINE SERVICES</h4><ul>
            <li><a href="https://www.pup.edu.ph/iapply/GSEE" {...ext}>PUP GSEE iApply</a></li>
            <li><a href="https://www.pup.edu.ph/gs/" {...ext}>PUP Graduate School</a></li>
            <li><a href="https://www.pup.edu.ph/gs/Fees" {...ext}>Graduate School Fees Schedule</a></li>
            <li><a href="https://www.pup.edu.ph/gs/mse" {...ext}>MSE Program Units</a></li>
          </ul></div>
          <div><h4>KEEP IN TOUCH</h4>
            <div className="soc">
              <a href={c.facebook || "#"} {...ext} aria-label="GSCpE Facebook page"><svg viewBox="0 0 24 24"><path d="M14 8V6.5c0-.7.3-1 1-1h2V2h-3c-3 0-4.5 1.8-4.5 4.4V8H7v3.5h2.5V22H14V11.5h2.7L17 8z" /></svg></a>
              <a href={"mailto:" + (c.emails[0] || "")} aria-label="Email GSCpE"><svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v.5l-10 6.3L2 6.5V6a1 1 0 0 1 1-1zm-1 4.1 10 6.2 10-6.2V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" /></svg></a>
            </div>
            <h4>CONTACT US</h4>
            <p className="ct">{rows.filter((r) => r[1]).map(([a, b], i) => <span key={i}>{a}<b>{b}</b><br /></span>)}</p>
          </div>
        </div>
        <div className="copy">© 2026 GSCpE, POLYTECHNIC UNIVERSITY OF THE PHILIPPINES GRADUATE SCHOOL</div>
      </div>
    </footer>
  );
}
