import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Editor",
  description: "Edits your resume",
  generator: "made without the use of large language models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
