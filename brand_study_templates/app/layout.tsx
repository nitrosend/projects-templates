import type { Metadata } from "next";
import "./globals.css";
import catalog from "../data/catalog.json";
const studies = catalog.templates.filter(t => t.study);
const brands = new Set(studies.map(t => t.study?.brand)).size;
export const metadata: Metadata = {
  title: "Email worth opening. | Nitrosend Templates",
  description: `${studies.length} brand studies. ${brands} distinct points of view. Explore standout email designs and make one yours in the Nitrosend editor. No signup to start.`,
  icons: { icon: "/nitrosend-icon.png" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
