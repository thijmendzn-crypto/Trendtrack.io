import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="nl">
      <body>
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
