import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vintro — Buy & sell pre-loved finds",
  description: "A marketplace for things with a past.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = false;

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans bg-stone-50 text-stone-900 antialiased selection:bg-teal-200 selection:text-teal-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col md:pl-60">
            <Header isLoggedIn={isLoggedIn} />
            <main className="flex-1">{children}</main>
          </div>
        </div>
        <Toaster position="bottom-right" reverseOrder={false} />
      </body>
    </html>
  );
}