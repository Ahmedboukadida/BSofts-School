import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { LocaleSync } from "@/components/locale-sync";

export const metadata: Metadata = {
  title: "BSofts School - School Management System",
  description: "Complete school management solution for modern education",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        <Providers>
          <LocaleSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
