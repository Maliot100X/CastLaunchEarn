"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { MiniAppProvider } from "./MiniAppContext";
import { useState, ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                refetchInterval: 5 * 60 * 1000, // 5 minutes - auto refresh for real-time data
            },
        },
    }));

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
