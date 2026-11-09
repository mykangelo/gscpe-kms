import type { Metadata } from "next";
import { Manrope, Montserrat } from "next/font/google";
import "./globals.css";
import "./gradknow.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400", "500", "600"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "GRADKnow: AI-Based GSCpE Knowledge Management System",
  description:
    "Admission, enrollment, policies, forms and program information for the PUP Graduate School Computer Engineering program, with an AI assistant that answers from official content.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${montserrat.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
