import type { Metadata } from "next";
import "./globals.css";
import Gate from "@/components/Gate";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Castle Internal — Customer Research",
  description: "Pre-call risk discovery on customer companies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&family=Geist:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Gate>
          <div style={{ display: "flex", minHeight: "100vh", background: "var(--bone)" }}>
            <Sidebar />
            <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
          </div>
        </Gate>
      </body>
    </html>
  );
}
