export async function GET() {
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta property="og:title" content="CastLaunchEarn Earn Boost" />
    <meta property="og:description" content="Manage coins boost stats and track leaderboards on Farcaster" />
    <meta property="og:image" content="https://cast-launch-earn.vercel.app/og-image.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://cast-launch-earn.vercel.app/share" />
    <title>CastLaunchEarn Share</title>
  </head>
  <body>
    <h1>CastLaunchEarn</h1>
    <p>Manage coins boost stats and track leaderboards on Farcaster</p>
  </body>
</html>`;

    return new Response(html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "public, max-age=0, must-revalidate",
        },
    });
}
