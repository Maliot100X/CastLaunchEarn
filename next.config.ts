import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019c0ff4-35e6-a9fd-7079-bf402e581696',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
