import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cast-launch-earn.vercel.app";

export const metadata: Metadata = {
  title: "CastLaunchEarn - Create & Trade Coins on Base",
  description: "Create & Trade Coins on Base - Farcaster Mini App",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "CastLaunchEarn",
    description: "Create & Trade Coins on Base - Farcaster Mini App",
    url: appUrl,
    siteName: "CastLaunchEarn",
    images: [{
      url: "/image.png",
      width: 1024,
      height: 1024,
    }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CastLaunchEarn",
    description: "Create & Trade Coins on Base",
    images: ["/image.png"],
  },
  other: {
    // Farcaster Mini App Frame tags
    "fc:frame": "vNext",
    "fc:frame:image": `${appUrl}/image.png`,
    "fc:frame:image:aspect_ratio": "1:1",
    "fc:frame:button:1": "Launch App",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": appUrl,
    "fc:frame:post_url": `${appUrl}/api/webhook`,

    // Additional OG tags
    "og:image": `${appUrl}/image.png`,
    "og:image:width": "1024",
    "og:image:height": "1024",
    "og:image:type": "image/png",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          CastLaunchEarn
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Create & Trade Coins on Base
        </p>
      </main>
    </div>
  );
}
