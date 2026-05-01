import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trendtrack - Ecom intelligence app",
  description:
    "Trendtrack is an e-commerce intelligence app for shops, ads, email campaigns, trends, and AI research.",
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
