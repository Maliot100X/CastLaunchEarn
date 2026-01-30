import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cast-launch-earn.vercel.app";

export const metadata: Metadata = {
    title: "CastLaunchEarn Earn Boost",
    description: "Manage coins boost stats and track leaderboards on Farcaster",
    openGraph: {
        title: "CastLaunchEarn Earn Boost",
        description: "Manage coins boost stats and track leaderboards on Farcaster",
        images: [`${appUrl}/og-image.png`],
        url: `${appUrl}/share`,
        type: "website",
    },
    other: {
        "fc:frame": "vNext",
        "fc:frame:image": `${appUrl}/og-image.png`,
        "fc:frame:button:1": "LaunchAndEarn",
        "fc:frame:button:1:action": "link",
        "fc:frame:button:1:target": appUrl,
    },
};

export default function SharePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    CastLaunchEarn
                </h1>
                <p className="text-gray-400 mt-4">Create, Launch, and Earn on Base</p>
            </div>
        </div>
    );
}
