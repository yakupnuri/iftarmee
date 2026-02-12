import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Iftar Match - Ramazan Davet Eşleştirme",
  description: "Ramazan iftar daveti eşleştirme sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} pb-24 sm:pb-0`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
