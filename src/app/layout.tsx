import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADOFAI.NET — Competitive Tournament Arena",
  description:
    "The competitive tournament arena for A Dance of Fire and Ice. Auto-generated tournaments, season system with 8 divisions, video-verified competition, clans, daily challenges, and e-sports-grade competition.",
  keywords: [
    "ADOFAI",
    "A Dance of Fire and Ice",
    "rhythm game",
    "competitive",
    "tournament",
    "esports",
    "ranking",
    "season",
    "clan",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
