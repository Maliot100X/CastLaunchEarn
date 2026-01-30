import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cast-launch-earn.vercel.app";

export const metadata: Metadata = {
    title: "CastLaunchEarn - Launch Your Coin on Base",
    description: "The ultimate Farcaster Mini App for creating and trading coins on Base. Earn rewards, climb leaderboards, and join the community.",
    openGraph: {
        title: "CastLaunchEarn",
        description: "Create & Trade Coins on Base - Farcaster Mini App",
        url: `${appUrl}/share`,
        images: [{
            url: "/hero.png",
            width: 1200,
            height: 630,
        }],
    },
};

export default function SharePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-900 to-black">
            <div className="max-w-2xl w-full text-center space-y-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    CastLaunchEarn
                </h1>

                <p className="text-xl text-gray-300">
                    Create • Launch • Earn on Base
                </p>

                <div className="space-y-4">
                    <p className="text-gray-400">
                        The ultimate Farcaster Mini App for creating and trading coins on Base.
                        Earn rewards, climb leaderboards, and join the community.
                    </p>
                </div>

                <div className="flex flex-col gap-4 max-w-md mx-auto">
                    <a
                        href={appUrl}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Launch App
                    </a>

                    <a
                        href="https://warpcast.com/~/compose?text=Check%20out%20CastLaunchEarn%20-%20Create%20%26%20Trade%20Coins%20on%20Base!%20%F0%9F%9A%80%0A%0Ahttps%3A%2F%2Fcast-launch-earn.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 border-2 border-purple-500 hover:bg-purple-500/10 rounded-lg font-semibold text-purple-400 transition-all duration-200"
                    >
                        Share on Warpcast
                    </a>
                </div>

                <div className="pt-8 text-sm text-gray-500">
                    by @maliot • Sponsored by Base & Farcaster
                </div>
            </div>
        </div>
    );
}
