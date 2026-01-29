"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { MiniAppProvider } from "./MiniAppContext";

export default function FarcasterProvider({ children }) {
  const queryClient = new QueryClient();

  return (
    <MiniAppProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </MiniAppProvider>
  );
}
