export const dynamic = 'force-static';

export async function GET() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CastLaunchEarn</title>
    <meta property="og:title" content="CastLaunchEarn Earn Boost" />
    <meta property="og:description" content="Manage coins boost stats and track leaderboards on Farcaster" />
    <meta property="og:image" content="https://cast-launch-earn.vercel.app/og-image.png" />
    <meta property="og:url" content="https://cast-launch-earn.vercel.app/share" />
    <meta property="og:type" content="website" />
</head>
<body style="margin:0;padding:0;background-color:#000000;display:flex;justify-content:center;align-items:center;height:100vh;">
    <a href="https://cast-launch-earn.vercel.app" style="display:inline-block;padding:12px 24px;background-color:#1a0a2e;color:#ffffff;font-weight:bold;border-radius:8px;text-decoration:none;font-family:sans-serif;">Launch App</a>
</body>
</html>`;

    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
}
