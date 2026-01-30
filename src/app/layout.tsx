import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import BottomNav from "@/components/BottomNav";
import AIBot from "@/components/AIBot";
import CryptoSnow from "@/components/CryptoSnow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cast-launch-earn.vercel.app";

export const metadata: Metadata = {
  title: "CastLaunchEarn - Create & Trade Coins on Base",
  description: "The ultimate Farcaster Mini App for creating and trading coins on Base. Earn rewards, climb leaderboards, and join the community.",
  metadataBase: new URL(appUrl),
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "CastLaunchEarn",
    description: "Create & Trade Coins on Base - Farcaster Mini App",
    url: appUrl,
    siteName: "CastLaunchEarn",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "CastLaunchEarn - Create & Trade Coins",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CastLaunchEarn",
    description: "Create & Trade Coins on Base",
    images: ["/hero.png"],
  },
  other: {
    // Farcaster Frame meta tags
    "fc:frame": "vNext",
    "fc:frame:image": `${appUrl}/hero.png`,
    "fc:frame:button:1": "Launch App",
    "fc:frame:button:1:action": "launch_frame",
    "fc:frame:button:1:target": appUrl,

    // Base platform verification
    "base:app_id": "697be9ea77db5d481cffc79d",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1a0a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <Providers>
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
          <AIBot />
        </Providers>
      </body>
    </html>
  );
}
