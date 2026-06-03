import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pilates Studio",
  description: "Profesionalni pilates treninzi u intimnom okruženju. Personalizovan pristup za svakoga.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
