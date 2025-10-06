import type { Metadata } from "next";
import { Poppins, Changa } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const changa = Changa({
  weight: ["400", "500", "600", "700"],
  variable: "--font-changa",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading",
  description: "Trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${changa.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
