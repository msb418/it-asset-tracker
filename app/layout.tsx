import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import Providers from "@/app/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "IT Asset SaaS",
  description: "Teaching starter for a production-grade IT asset tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster richColors position="top-center" />
          <div className="min-h-screen">
            <NavBar />
            <main className="max-w-6xl mx-auto p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}