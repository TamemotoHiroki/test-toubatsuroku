import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const misaki = localFont({
  src: "./fonts/misaki_gothic_2nd.ttf",
  variable: "--font-misaki",
});

export const metadata: Metadata = {
  title: "テスト討伐録",
  description: "テストに立ち向かえ、、、",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${misaki.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
