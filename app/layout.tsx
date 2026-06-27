import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/app/_components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayudavenezuela.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ayuda a Venezuela | Venezuela Lives Matter",
  description:
    "Mapa mobile-first de centros verificados para apoyar ayuda a Venezuela con ubicaciones, horarios y contactos publicos.",
  openGraph: {
    description:
      "Encuentra y comparte centros verificados para apoyar ayuda a Venezuela.",
    siteName: "Venezuela Lives Matter",
    title: "Ayuda a Venezuela | Venezuela Lives Matter",
    type: "website",
  },
  twitter: {
    card: "summary",
    description:
      "Encuentra y comparte centros verificados para apoyar ayuda a Venezuela.",
    title: "Ayuda a Venezuela | Venezuela Lives Matter",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip">
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
