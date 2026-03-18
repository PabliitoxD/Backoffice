import type { Metadata } from "next";
import "./globals.css";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// We are importing Inter font globally via Google Fonts in globals.css for simplicity right now.
// The next/font/google package is great but we want to stick to standard CSS imports for the static prototype rules.

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
    <html lang="pt-BR">
      <body>
        {/* 
          This is the primary wrapper for the entire backoffice application.
          The children here will typically be our Dashboard Layout (Sidebar + Header + Content).
        */}
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}

