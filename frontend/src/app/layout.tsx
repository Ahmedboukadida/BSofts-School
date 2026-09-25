import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import { LocaleSync } from "@/components/locale-sync";
import type { Locale } from "@/components/providers/i18n-provider";

export const metadata: Metadata = {
  title: "BSofts School - School Management System",
  description: "Complete school management solution for modern education",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("locale")?.value as Locale | undefined;
  const initialLocale: Locale = (savedLocale === "ar" || savedLocale === "en" || savedLocale === "fr")
    ? savedLocale
    : "fr";
  const dir = initialLocale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={initialLocale} dir={dir} className="h-full antialiased">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily: initialLocale === "ar" ? "'Cairo', 'Tajawal', sans-serif" : "'Satoshi', sans-serif",
        }}
      >
        <Providers initialLocale={initialLocale}>
          <LocaleSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
