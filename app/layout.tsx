import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import ClientProviders from "./client-providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === "production"
  ? "https://home.vocespace.com"
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Voce Space | Self-hosted conference app",
    template: "%s",
  },
  description:
    "Voce space is WebRTC project that gives you everything needed to build scalable and real-time audio and/or video experiences in your applications.",
  icons: {
    icon: {
      rel: "icon",
      url: "/favicon.ico",
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#101828',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
