"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/", "Home"], ["/ask", "Ask AI"], ["/documents", "Documents"], ["/enrollment", "Enrollment"], ["/policies", "Policies"], ["/program", "Program"],
] as const;

export default function Nav() {
  const path = usePathname();
  return (
    <nav>
      <div className="w">
        <Link className="brand" href="/">GRAD<span>Know</span></Link>
        <div className="nt">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} aria-current={(href === "/" ? path === "/" : path.startsWith(href)) ? "page" : undefined}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
