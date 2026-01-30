import { http, createConfig } from "wagmi";
import { base, zora } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors";

// RPC URL - use public or environment variable
const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";

// Get Project ID from env (User must set this in Vercel)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const wagmiConfig = createConfig({
  chains: [base, zora],
  transports: {
    [base.id]: http(rpcUrl),
    [zora.id]: http(),
  },
  connectors: [
    // Farcaster MiniApp connector (correct import name)
    farcasterMiniApp(),
    // MetaMask for web browser
    metaMask({
      dappMetadata: {
        name: "CastLaunchEarn",
        url: "https://cast-launch-earn.vercel.app",
      },
    }),
    // Coinbase Wallet  
    coinbaseWallet({
      appName: "CastLaunchEarn",
      appLogoUrl: "https://cast-launch-earn.vercel.app/icon.jpg",
    }),
    // WalletConnect (Explicitly added for broader support)
    walletConnect({ projectId }),
    // Generic injected wallet (fallback)
    injected({
      shimDisconnect: true,
    }),
  ],
});
