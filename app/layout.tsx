import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroMyelinDx — MRI White Matter Pattern Navigator",
  description: "Step-by-step MRI pattern navigator for white matter disease and MS / NMOSD / MOGAD.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
