import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prana · Chakras, Ashtanga y Savasana",
  description:
    "Descubre los siete chakras, practica Ashtanga guiado en audio, termina con un minuto de Savasana y lleva el registro de tu semana.",
};

export const viewport: Viewport = {
  themeColor: "#f1f1ef",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
