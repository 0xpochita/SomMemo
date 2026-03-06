import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SomMemo",
  description: "Decentralized crypto inheritance protocol on Somnia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
