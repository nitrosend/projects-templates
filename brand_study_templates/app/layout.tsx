import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Email worth opening. | Nitrosend Templates",
  description: "306 brand studies. 36 distinct points of view. Explore standout email designs and make one yours in the Nitrosend editor. No signup to start.",
  icons: { icon: "/nitrosend-icon.png" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
