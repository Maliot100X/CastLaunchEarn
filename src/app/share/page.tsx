import type { Metadata } from "next";

const appUrl = "https://cast-launch-earn.vercel.app";

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
    return null;
}
