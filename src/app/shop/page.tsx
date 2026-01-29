"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { Zap, Clock, Star, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useMiniApp } from "@/providers/MiniAppContext";
import { parseEther } from "viem";

interface BoostPackage {
    id: string;
    name: string;
    price: number;
    duration: number; // minutes
    icon: React.ReactNode;
    color: string;
    description: string;
}

const boostPackages: BoostPackage[] = [
    {
        id: "basic",
        name: "Basic Boost",
        price: 1,
        duration: 10,
        icon: <Zap className="w-6 h-6" />,
        color: "from-blue-500 to-blue-700",
        description: "Feature your coin in the Boosted tab",
    },
    {
        id: "super",
        name: "Super Boost",
        price: 3,
        duration: 25,
        icon: <Star className="w-6 h-6" />,
        color: "from-purple-500 to-pink-600",
        description: "Featured + highlighted with special badge",
    },
    {
        id: "hyper",
        name: "Hyper Boost",
        price: 6,
        duration: 60,
        icon: <Sparkles className="w-6 h-6" />,
        color: "from-yellow-500 to-orange-500",
        description: "Push notification to all users + extended visibility",
    },
];

interface UserCoin {
    id: string;
    coin_address: string;
    name: string;
    symbol: string;
}

interface ActiveBoost {
    id: string;
    coin_id: string;
    boost_type: string;
    expires_at: string;
    coins: UserCoin;
}

export default function ShopPage() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { user } = useMiniApp();

    const [userCoins, setUserCoins] = useState<UserCoin[]>([]);
    const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
    const [selectedCoin, setSelectedCoin] = useState<string>("");
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.fid) {
            fetchUserCoins();
            fetchActiveBoosts();
        }
    }, [user?.fid]);

    const fetchUserCoins = async () => {
        if (!user?.fid) return;
        const { data } = await supabase
            .from('coins')
            .select('*')
            .eq('creator_fid', user.fid);
        if (data) setUserCoins(data);
    };

    const fetchActiveBoosts = async () => {
        if (!user?.fid) return;
        const { data } = await supabase
            .from('boosts')
            .select(`*, coins(*)`)
            .gt('expires_at', new Date().toISOString());
        if (data) setActiveBoosts(data);
    };

    const handlePurchase = async (pkg: BoostPackage) => {
        if (!selectedCoin || !walletClient || !isConnected) return;

        setIsPurchasing(true);
        setPurchasingId(pkg.id);

        try {
            // Convert USD to ETH (approximate)
            const ethPrice = pkg.price / 2500; // Rough conversion
            const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`;

            // Send payment
            const hash = await walletClient.sendTransaction({
                to: platformWallet,
                value: parseEther(ethPrice.toString()),
            });

            // Wait for transaction
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash });
            }

            // Record boost in database
            const expiresAt = new Date(Date.now() + pkg.duration * 60 * 1000);
            await supabase.from('boosts').insert({
                coin_id: selectedCoin,
                boost_type: pkg.id,
                price_usd: pkg.price,
                expires_at: expiresAt.toISOString(),
                tx_hash: hash,
            });

            await fetchActiveBoosts();
            alert(`🚀 ${pkg.name} activated! Your coin is now boosted!`);
        } catch (err: any) {
            console.error("Purchase failed:", err);
            alert("Purchase failed. Please try again.");
        } finally {
            setIsPurchasing(false);
            setPurchasingId(null);
        }
    };

    const getTimeRemaining = (expiresAt: string) => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return "Expired";
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-white mb-2">Boost Shop</h1>
                <p className="text-gray-400 mb-6">Supercharge your coin's visibility</p>

                {/* Active Boosts */}
                {activeBoosts.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-medium text-gray-400 mb-3">Active Boosts</h2>
                        <div className="space-y-2">
                            {activeBoosts.map((boost) => (
                                <div
                                    key={boost.id}
                                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 flex items-center justify-between border border-yellow-500/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            🔥
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                ${boost.coins?.symbol || "Unknown"}
                                            </p>
                                            <p className="text-xs text-gray-400">{boost.boost_type} boost</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-yellow-400 boost-timer px-2 py-1 rounded">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {getTimeRemaining(boost.expires_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Select Coin Dropdown */}
                {userCoins.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Coin to Boost
                        </label>
                        <select
                            value={selectedCoin}
                            onChange={(e) => setSelectedCoin(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">Choose a coin...</option>
                            {userCoins.map((coin) => (
                                <option key={coin.id} value={coin.id}>
                                    ${coin.symbol} - {coin.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Boost Packages */}
                <div className="space-y-4">
                    {boostPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`bg-gradient-to-br ${pkg.color} rounded-2xl p-4 relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />

                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                        {pkg.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{pkg.name}</h3>
                                        <p className="text-sm text-white/80">{pkg.duration} minutes</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">${pkg.price}</p>
                                    <p className="text-xs text-white/60">≈ ETH</p>
                                </div>
                            </div>

                            <p className="text-sm text-white/80 mb-4">{pkg.description}</p>

                            <button
                                onClick={() => handlePurchase(pkg)}
                                disabled={!isConnected || !selectedCoin || isPurchasing}
                                className="w-full py-3 rounded-xl bg-white/20 backdrop-blur text-white font-bold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {purchasingId === pkg.id ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Buy Now
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* No Coins Message */}
                {userCoins.length === 0 && isConnected && (
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-xl text-center">
                        <p className="text-gray-400 mb-2">You haven't created any coins yet!</p>
                        <a href="/create" className="text-purple-400 hover:underline">
                            Create your first coin →
                        </a>
                    </div>
                )}

                {/* Not Connected */}
                {!isConnected && (
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-xl text-center text-gray-400">
                        Connect your wallet to purchase boosts
                    </div>
                )}
            </div>
        </div>
    );
}
