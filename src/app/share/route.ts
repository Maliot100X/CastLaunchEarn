import { NextResponse } from 'next/server';

export async function GET() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CastLaunchEarn Share</title>
    <meta property="og:title" content="CastLaunchEarn Earn Boost" />
    <meta property="og:description" content="Manage coins boost stats and track leaderboards on Farcaster" />
    <meta property="og:image" content="https://cast-launch-earn.vercel.app/og-image.png" />
    <meta property="og:url" content="https://cast-launch-earn.vercel.app/share" />
    <meta property="og:type" content="website" />
</head>
<body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;background-color:#000000;font-family:sans-serif;">
    <a href="https://cast-launch-earn.vercel.app" style="display:inline-block;padding:12px 24px;background-color:#1a0a2e;color:#ffffff;font-weight:bold;border-radius:8px;text-decoration:none;">Launch App</a>
</body>
</html>`;

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
