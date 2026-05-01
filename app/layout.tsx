import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { hasRealEnvValue } from "./lib/env";
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
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkPublishableKeyReady = hasRealEnvValue(clerkPublishableKey, ["pk_test_", "pk_live_"]);

  return (
    <html lang="nl">
      <body>
        {clerkPublishableKeyReady && clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
