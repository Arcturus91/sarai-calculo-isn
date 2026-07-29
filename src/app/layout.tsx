import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";

import "./globals.css";

/*
  Tres familias para tres registros de información:
  sans para la interfaz, mono para toda cifra y fecha, serif para la ley.
*/
const plexSans = IBM_Plex_Sans({
  variable: "--fuente-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--fuente-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const plexSerif = IBM_Plex_Serif({
  variable: "--fuente-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "ISN Coahuila — Impuesto sobre nóminas",
  description:
    "Calcula, guarda y exporta el Impuesto Sobre Nóminas del estado de Coahuila mes a mes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${plexSans.variable} ${plexMono.variable} ${plexSerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
