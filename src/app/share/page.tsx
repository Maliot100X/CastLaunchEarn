import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "CastLaunchEarn Earn Boost",
    description: "Manage coins boost stats and track leaderboards on Farcaster",
    openGraph: {
        title: "CastLaunchEarn Earn Boost",
        description: "Manage coins boost stats and track leaderboards on Farcaster",
        url: "https://cast-launch-earn.vercel.app/share",
        siteName: "CastLaunchEarn",
        images: [
            {
                url: "https://cast-launch-earn.vercel.app/og-image.png",
                width: 1200,
                height: 630,
                alt: "CastLaunchEarn",
            },
        ],
        type: "website",
    },
};

export default function SharePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a0a2e] text-white p-4">
            <h1 className="text-2xl font-bold mb-4">CastLaunchEarn</h1>
            <p className="mb-6">Manage coins boost stats and track leaderboards on Farcaster</p>
            <a
                href="https://cast-launch-earn.vercel.app"
                className="px-6 py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-700 transition"
            >
                Launch App
            </a>
        </div>
    );
}
