"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useWalletClient, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { useMiniApp, useFarcasterAuth, useViewProfile } from "@/providers/MiniAppContext";
import {
    User, Wallet, LogIn, LogOut, RefreshCw, Copy, Check,
    ExternalLink, Award, Coins, TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfileCoins, getProfileBalances } from "@/lib/coinQueries";
import { formatAddress, formatNumber } from "@/lib/utils";

interface UserStats {
    coinsCreated: number;
    totalVolume: number;
    holdersCount: number;
    score: number;
    rank: number;
}

interface UserCoin {
    address: string;
    name: string;
    symbol: string;
    imageUrl?: string;
}

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { user, isInMiniApp } = useMiniApp();
    const { signIn, isAuthenticating } = useFarcasterAuth();
    const { viewProfile } = useViewProfile();

    const [stats, setStats] = useState<UserStats>({
        coinsCreated: 0,
        totalVolume: 0,
        holdersCount: 0,
        score: 0,
        rank: 0,
    });
    const [myCoins, setMyCoins] = useState<UserCoin[]>([]);
    const [myHoldings, setMyHoldings] = useState<UserCoin[]>([]);
    const [activeTab, setActiveTab] = useState<"coins" | "holdings">("coins");
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // NEW: Premium Logic
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handleSubscription = async (plan: 'trial' | 'monthly', price: number) => {
        if (!walletClient || !address) {
            alert("Please connect wallet first!");
            return;
        }

        setIsPurchasing(true);
        try {
            const platformWallet = '0xccd1e099590bfedf279e239558772bbb50902ef6';
            const ethPrice = price / 2500; // Hardcoded approx conversion

            // 1. Send Payment
            const hash = await walletClient.sendTransaction({
                to: platformWallet,
                value: parseEther(ethPrice.toFixed(18)), // Ensure precision
            });

            // 2. Wait for confirmation
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash });
            }

            // 3. Record in DB
            if (user?.fid) {
                // Determine expiration
                const days = plan === 'trial' ? 7 : 30;
                const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

                await supabase.from('users')
                    .update({
                        is_subscriber: true,
                        subscriber_since: new Date().toISOString() // Or separate table
                    })
                    .eq('fid', user.fid);

                alert(`🎉 Premium Unlocked! Welcome to the club.`);
            } else {
                alert(`Transaction sent! hash: ${hash}. Sync Farcaster to unlock features fully.`);
            }

        } catch (error) {
            console.error("Subscription failed:", error);
            alert("Transaction failed. ensure you have ETH on Base.");
        } finally {
            setIsPurchasing(false);
        }
    };


    useEffect(() => {
        if (user?.fid) {
            fetchUserData();
        }
        if (address) {
            fetchCoinsData();
        }
    }, [user?.fid, address]);

    const fetchUserData = async () => {
        if (!user?.fid) return;
        setIsLoading(true);

        try {
            // Get user from database
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('fid', user.fid)
                .single();

            if (userData) {
                setStats({
                    coinsCreated: 0, // Will be updated from coins count
                    totalVolume: 0,
                    holdersCount: 0,
                    score: userData.score || 0,
                    rank: 0,
                });
            }

            // Get user's coins
            const { data: coins } = await supabase
                .from('coins')
                .select('*')
                .eq('creator_fid', user.fid);

            if (coins) {
                setMyCoins(coins.map((c: any) => ({
                    address: c.coin_address,
                    name: c.name,
                    symbol: c.symbol,
                    imageUrl: c.image_url,
                })));
                setStats(prev => ({ ...prev, coinsCreated: coins.length }));
            }

            // Get rank
            const { data: allUsers } = await supabase
                .from('users')
                .select('fid, score')
                .order('score', { ascending: false });

            if (allUsers) {
                const rank = allUsers.findIndex((u: any) => u.fid === user.fid) + 1;
                setStats(prev => ({ ...prev, rank: rank || 0 }));
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCoinsData = async () => {
        if (!address) return;

        try {
            // Get holdings from Zora
            const balances = await getProfileBalances(address);
            const edges = balances?.data?.profile?.coinBalances?.edges || [];
            setMyHoldings(edges.map((edge: any) => ({
                address: edge.node.coin?.address || "",
                name: edge.node.coin?.name || "Unknown",
                symbol: edge.node.coin?.symbol || "???",
                imageUrl: edge.node.coin?.mediaContent?.previewImage?.small,
            })));
        } catch (err) {
            console.error("Error fetching coin data:", err);
        }
    };

    const handleSync = async () => {
        if (!user) {
            await signIn();
        }
        await fetchUserData();
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

                {/* User Card */}
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 mb-6 border border-purple-500/30">
                    <div className="flex items-center gap-4 mb-4">
                        {user?.pfpUrl ? (
                            <img
                                src={user.pfpUrl}
                                alt={user.displayName || "User"}
                                className="w-16 h-16 rounded-full ring-2 ring-purple-500"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">
                                {user?.displayName || user?.username || "Anonymous"}
                            </h2>
                            {user?.username && (
                                <p className="text-purple-300">@{user.username}</p>
                            )}
                            {user?.fid && (
                                <p className="text-sm text-gray-400">FID: {user.fid}</p>
                            )}
                        </div>
                        {user && (
                            <button
                                onClick={() => viewProfile(user.fid)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <ExternalLink className="w-5 h-5 text-gray-300" />
                            </button>
                        )}
                        {/* Sync Button */}
                        {!user && (
                            <button
                                onClick={handleSync}
                                disabled={isAuthenticating}
                                className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-purple-500 transition-colors disabled:opacity-50"
                            >
                                {isAuthenticating ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-5 h-5" />
                                )}
                                Sync Farcaster Profile
                            </button>
                        )}
                    </div>

                    {/* Premium Membership Card */}
                    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 mb-6 border border-yellow-500/30">
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="w-8 h-8 text-yellow-400" />
                            <div>
                                <h2 className="text-xl font-bold text-white">Premium Membership</h2>
                                <p className="text-sm text-yellow-200/80">Unlock exclusive powers</p>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6 text-sm text-gray-300">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-400" /> Special ⭐ Badge on Profile</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-400" /> 1 Free Boost / Month</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-400" /> Priority Support</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-400" /> Early Access to New Features</li>
                        </ul>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSubscription('trial', 1)}
                                disabled={isPurchasing}
                                className="bg-gray-800 text-white py-2 rounded-xl text-sm font-bold hover:bg-gray-700 transition"
                            >
                                $1 Trial (7 Days)
                            </button>
                            <button
                                onClick={() => handleSubscription('monthly', 15)}
                                disabled={isPurchasing}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
                            >
                                $15 / Month
                            </button>
                        </div>
                    </div>

                    {/* Wallet Section */}
                    <div className="bg-gray-900/50 rounded-2xl p-4 mb-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Wallet
                            </span>
                        </div>

                        {isConnected && address ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-white">{formatAddress(address)}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={copyAddress}
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                        <a
                                            href={`https://basescan.org/address/${address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                        </a>
                                    </div>
                                </div>
                                <button
                                    onClick={() => disconnect()}
                                    className="w-full py-2 rounded-xl bg-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {connectors.map((connector) => (
                                    <button
                                        key={connector.uid}
                                        onClick={() => connect({ connector })}
                                        className="w-full py-3 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-300 font-bold flex items-center justify-center gap-2 hover:bg-purple-500/20 transition-colors"
                                    >
                                        <Wallet className="w-5 h-5" />
                                        Connect {connector.name}
                                    </button>
                                ))}
                                {connectors.length === 0 && (
                                    <p className="text-center text-gray-400">No wallets detected. Try opening in MetaMask app or Coinbase Wallet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <Coins className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{stats.coinsCreated}</p>
                            <p className="text-xs text-gray-400">Coins Created</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">#{stats.rank || "-"}</p>
                            <p className="text-xs text-gray-400">Rank</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{formatNumber(stats.score)}</p>
                            <p className="text-xs text-gray-400">Score</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <Wallet className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{myHoldings.length}</p>
                            <p className="text-xs text-gray-400">Holdings</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab("coins")}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "coins"
                                ? "bg-purple-600 text-white"
                                : "bg-white/5 text-gray-400"
                                }`}
                        >
                            My Coins ({myCoins.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("holdings")}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "holdings"
                                ? "bg-purple-600 text-white"
                                : "bg-white/5 text-gray-400"
                                }`}
                        >
                            Holdings ({myHoldings.length})
                        </button>
                    </div>

                    {/* Coins/Holdings List */}
                    <div className="space-y-2">
                        {(activeTab === "coins" ? myCoins : myHoldings).length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                {activeTab === "coins" ? (
                                    <>
                                        <p className="mb-2">No coins created yet</p>
                                        <a href="/create" className="text-purple-400 hover:underline">
                                            Create your first coin →
                                        </a>
                                    </>
                                ) : (
                                    <p>No holdings yet</p>
                                )}
                            </div>
                        ) : (
                            (activeTab === "coins" ? myCoins : myHoldings).map((coin) => (
                                <a
                                    key={coin.address}
                                    href={`https://zora.co/coin/base:${coin.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl hover:bg-gray-800/50 transition-colors"
                                >
                                    {coin.imageUrl ? (
                                        <img src={coin.imageUrl} alt={coin.name} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {coin.symbol.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{coin.name}</p>
                                        <p className="text-sm text-gray-400">${coin.symbol}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-500" />
                                </a>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
