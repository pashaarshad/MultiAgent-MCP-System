import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * ============================================
 * ROOT LAYOUT
 * ============================================
 * Main application layout with fonts and metadata
 * 
 * CUSTOMIZATION:
 * - Change fonts below
 * - Update metadata for SEO
 * - Modify body classes
 */

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Multi-Agent MCP System | AI-Powered Frontend Builder",
  description: "Build beautiful websites instantly with AI. Describe your vision and watch it come to life with our multi-agent MCP-powered builder.",
  keywords: ["AI", "website builder", "MCP", "frontend", "code generation", "multi-agent"],
  authors: [{ name: "Multi-Agent MCP System" }],
  openGraph: {
    title: "Multi-Agent MCP System",
    description: "AI-Powered Frontend Builder",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
