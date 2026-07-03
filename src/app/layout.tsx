import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Application Dashboard",
  description: "Statistics dashboard for job applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
