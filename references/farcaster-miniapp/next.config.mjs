/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "https://api.farcaster.xyz/miniapps/hosted-manifest/0198285c-57c5-ad62-ecf6-545a3079e9d5",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
