import type { Metadata } from "next";
import "./globals.css";

// We are importing Inter font globally via Google Fonts in globals.css for simplicity right now.
// The next/font/google package is great but we want to stick to standard CSS imports for the static prototype rules.

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Backoffice | Admin Dashboard",
  description: "Secure and scalable administrative panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

