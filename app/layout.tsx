import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitBase - Split tagihan jadi gampang banget",
  description: "Masukan total tagihan, tambahkan teman, dan SplitBase hitung semuanya otomatis.",
};

const theme = createTheme({
  primaryColor: "emerald",
  colors: {
    emerald: [
      "#e6fbf4",
      "#d3f4e9",
      "#aae8d3",
      "#7edabc",
      "#5ad2a9",
      "#42cc9b",
      "#34c994",
      "#25b180",
      "#1a9e71",
      "#006d4e",
    ],
  },
  fontFamily: "var(--font-plus-jakarta), sans-serif",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
