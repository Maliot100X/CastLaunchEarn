import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cast-launch-earn.vercel.app";

export const metadata: Metadata = {
    title: "CastLaunchEarn Earn Boost",
    description: "Manage coins boost stats and track leaderboards on Farcaster",
    openGraph: {
        title: "CastLaunchEarn Earn Boost",
        description: "Manage coins boost stats and track leaderboards on Farcaster",
        url: `${appUrl}/share`,
        type: "website",
        images: [{
            url: `${appUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: "CastLaunchEarn",
        }],
    },
};

export default function SharePage() {
    return (
        <div>
            <h1>CastLaunchEarn</h1>
            <p>Create, Launch, and Earn on Base</p>
        </div>
    );
}
