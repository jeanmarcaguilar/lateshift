import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import CartButton from "@/components/CartButton";
import "./globals.css";
const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
export const metadata: Metadata = { title: "The Late Shift: Smash Burgers, 6PM to 3AM", description: "Smashed to order. Open till 3AM. No freezer." };
export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}{modal}<CartButton /></body>
    </html>
  );
}
