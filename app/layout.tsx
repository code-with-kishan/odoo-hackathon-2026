import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IronRoute",
  description: "Industrial fleet operations platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-text-primary)]">{children}</body>
    </html>
  );
}
