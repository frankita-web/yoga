import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prana · Chakras, Ashtanga y Savasana",
  description:
    "Descubre los siete chakras, practica la serie primaria de Ashtanga guiada en audio y termina con un minuto de Savasana.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
