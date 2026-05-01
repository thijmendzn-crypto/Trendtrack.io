import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalPilot App - Ecom trend intelligence",
  description:
    "SignalPilot is an e-commerce trend intelligence app for signals, ads, competitors, and launch planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
