"use client";

import { useState, useEffect } from "react";
import { Flame, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import CoinCard from "@/components/CoinCard";
import { getNewCoins, getTrendingCoins } from "@/lib/coinQueries";
import { supabase } from "@/lib/supabase";

type Tab = "new" | "trending" | "boosted";

interface CoinData {
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  holders?: number;
  creatorName?: string;
  creatorPfp?: string;
  isBoosted?: boolean;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [boostedCoins, setBoostedCoins] = useState<CoinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch coins based on active tab
  const fetchCoins = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "boosted") {
        // Fetch boosted coins from our database
        const { data: boosts } = await supabase
          .from('boosts')
          .select(`
            *,
            coins (*)
          `)
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false });

        if (boosts) {
          const boosted = boosts.map((b: any) => ({
            address: b.coins.coin_address,
            name: b.coins.name,
            symbol: b.coins.symbol,
            imageUrl: b.coins.image_url,
            isBoosted: true,
          }));
          setBoostedCoins(boosted);
        }
        setIsLoading(false);
        return;
      }

      const response = activeTab === "new"
        ? await getNewCoins(20)
        : await getTrendingCoins(20);

      const edges = response?.data?.exploreList?.edges || [];
      const formattedCoins: CoinData[] = edges.map((edge: any) => {
        const coin = edge.node;
        return {
          address: coin.address || coin.id,
          name: coin.name || "Unknown",
          symbol: coin.symbol || "???",
          imageUrl: coin.mediaContent?.previewImage?.small || coin.imageUrl,
          price: parseFloat(coin.marketCap || coin.price || "0"),
          priceChange24h: parseFloat(coin.priceChange24h || "0"),
          volume24h: parseFloat(coin.volume24h || "0"),
          holders: coin.uniqueHolders || 0,
          creatorName: coin.creator?.username || coin.creatorAddress?.slice(0, 8),
          creatorPfp: coin.creator?.avatar,
        };
      });

      setCoins(formattedCoins);
    } catch (error) {
      console.error("Error fetching coins:", error);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const displayCoins = activeTab === "boosted" ? boostedCoins : coins;

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">CastLaunchEarn</h1>
          <p className="text-sm text-gray-400">Create & Trade Coins on Base</p>
        </div>
        <button
          onClick={fetchCoins}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("new")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === "new"
              ? "bg-purple-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
        >
          <Sparkles className="w-4 h-4" />
          New Coins
        </button>
        <button
          onClick={() => setActiveTab("trending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === "trending"
              ? "bg-purple-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trending
        </button>
        <button
          onClick={() => setActiveTab("boosted")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === "boosted"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
        >
          <Flame className="w-4 h-4" />
          🔥 King of Hill
        </button>
      </div>

      {/* Coins Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-gray-900/50 shimmer" />
          ))}
        </div>
      ) : displayCoins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayCoins.map((coin) => (
            <CoinCard
              key={coin.address}
              {...coin}
              onClick={() => {
                // Open coin detail or trading modal
                window.open(`https://zora.co/coin/base:${coin.address}`, '_blank');
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {activeTab === "boosted"
              ? "No boosted coins yet. Be the first to boost! 🚀"
              : "No coins found. Check back soon!"}
          </p>
        </div>
      )}

      {/* Last refresh indicator */}
      <p className="text-center text-xs text-gray-500 mt-6">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </p>
    </div>
  );
}
