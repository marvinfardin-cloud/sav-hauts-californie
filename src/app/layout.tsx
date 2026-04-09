import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Les Hauts de Californie — SAV",
  description: "Service Après-Vente — Les Hauts de Californie, Le Lamentin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
