import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local"
import "./globals.css";
import { Locale, getDictionary } from "@/localization";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const materialSymbols = localFont({
  variable: '--font-family-symbols', // Variable name (to reference after in CSS/styles)
  style: 'normal',
  src: '../../../node_modules/material-symbols/material-symbols-rounded.woff2', // This is a reference to woff2 file from NPM package "material-symbols"
  display: 'block',
  weight: '100 700',
})

export const metadata: Metadata = {
  title: "Waypoint",
  description: "The all-purpose discord bot.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: {
    lang: Locale
  }
}>) {
  const locale = params.lang
  const langDict = await getDictionary(locale)
  return (
    <html lang={locale} className={`${inter.variable} ${materialSymbols.variable}`}>
      <body className="bg-background">
        <Providers dictionary={langDict}>
          <main className="max-w-[1920px] min-h-screen m-auto flex flex-col justify-start items-center px-5 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
