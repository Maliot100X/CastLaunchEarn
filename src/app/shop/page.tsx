"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { Zap, Clock, Star, Sparkles, Loader2, Search, CheckCircle, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useMiniApp } from "@/providers/MiniAppContext";
import { parseEther, type Address } from "viem";

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

interface ScannedCoin {
    address: string;
    name: string;
    symbol: string;
    decimals?: number;
}

interface ActiveBoost {
    id: string;
    coin_id: string;
    boost_type: string;
    expires_at: string;
    coins: {
        symbol: string;
        name: string;
        coin_address: string;
    };
}

const ERC20_ABI = [
    {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }],
    },
    {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }],
    },
    {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint8' }],
    }
] as const;

export default function ShopPage() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { user } = useMiniApp();

    const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
    const [scanAddress, setScanAddress] = useState("");
    const [scannedCoin, setScannedCoin] = useState<ScannedCoin | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        fetchActiveBoosts();
    }, []);

    const fetchActiveBoosts = async () => {
        const { data } = await supabase
            .from('boosts')
            .select(`*, coins(*)`)
            .gt('expires_at', new Date().toISOString());
        if (data) setActiveBoosts(data);
    };

    const handleScan = async () => {
        if (!publicClient || !scanAddress.startsWith("0x") || scanAddress.length !== 42) {
            alert("Please enter a valid contract address");
            return;
        }

        setIsScanning(true);
        setScannedCoin(null);

        try {
            const [name, symbol, decimals] = await Promise.all([
                publicClient.readContract({
                    address: scanAddress as Address,
                    abi: ERC20_ABI,
                    functionName: 'name',
                }).catch(() => "Unknown Coin"),
                publicClient.readContract({
                    address: scanAddress as Address,
                    abi: ERC20_ABI,
                    functionName: 'symbol',
                }).catch(() => "???"),
                publicClient.readContract({
                    address: scanAddress as Address,
                    abi: ERC20_ABI,
                    functionName: 'decimals',
                }).catch(() => 18),
            ]);

            setScannedCoin({
                address: scanAddress,
                name: String(name),
                symbol: String(symbol),
                decimals: Number(decimals),
            });
        } catch (error) {
            console.error("Scan failed:", error);
            alert("Could not scan coin. Is it a valid ERC20 token on Base?");
        } finally {
            setIsScanning(false);
        }
    };

    const handlePurchase = async (pkg: BoostPackage) => {
        if (!scannedCoin || !walletClient || !isConnected) return;

        setIsPurchasing(true);
        setPurchasingId(pkg.id);

        try {
            // 1. Ensure coin exists in DB
            let coinId: string;

            // Check if exists
            const { data: existing } = await supabase
                .from('coins')
                .select('id')
                .eq('coin_address', scannedCoin.address)
                .single();

            if (existing) {
                coinId = existing.id;
            } else {
                // Insert new coin record
                const { data: newCoin, error: insertError } = await supabase
                    .from('coins')
                    .insert({
                        coin_address: scannedCoin.address,
                        name: scannedCoin.name,
                        symbol: scannedCoin.symbol,
                        creator_fid: user?.fid || 0, // Fallback if unknown
                        description: "Imported via Boost Shop",
                        created_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (insertError) throw insertError;
                coinId = newCoin.id;
            }

            // 2. Process Payment
            // HARDCODED RECEIPIENT AS REQUESTED
            const platformWallet = '0xccd1e099590bfedf279e239558772bbb50902ef6';
            const ethPrice = pkg.price / 2500; // Approx $2500 ETH

            const hash = await walletClient.sendTransaction({
                to: platformWallet,
                value: parseEther(ethPrice.toString()),
            });

            // 3. Wait for confirmation
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash });
            }

            // 4. Create Boost Record (This triggers "King of the Hill")
            const expiresAt = new Date(Date.now() + pkg.duration * 60 * 1000);

            await supabase.from('boosts').insert({
                coin_id: coinId,
                boost_type: pkg.id,
                price_usd: pkg.price,
                expires_at: expiresAt.toISOString(),
                tx_hash: hash,
            });

            await fetchActiveBoosts();
            setScanAddress("");
            setScannedCoin(null);
            alert(`🚀 Boost Activated! ${scannedCoin.name} is now King of the Hill!`);

        } catch (err: any) {
            console.error("Purchase failed:", err);
            alert("Transaction failed. Please try again.");
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
        <div className="min-h-screen p-4 pb-24">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-white mb-2">Boost Shop 🚀</h1>
                <p className="text-gray-400 mb-6">Scan any coin and crown it King of the Hill.</p>

                {/* 1. Scan Section */}
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Enter Coin Contract Address
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="0x..."
                            value={scanAddress}
                            onChange={(e) => setScanAddress(e.target.value)}
                            className="flex-1 px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                        />
                        <button
                            onClick={handleScan}
                            disabled={isScanning || !scanAddress}
                            className="px-4 py-3 bg-purple-600 rounded-xl text-white font-bold hover:bg-purple-500 disabled:opacity-50"
                        >
                            {isScanning ? <Loader2 className="animate-spin" /> : <Search />}
                        </button>
                    </div>
                </div>

                {/* 2. Preview & Buy Section */}
                {scannedCoin && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-1 rounded-2xl border border-purple-500/50 mb-6">
                            <div className="bg-black/80 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-bold">
                                        {scannedCoin.symbol[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">{scannedCoin.name}</h3>
                                        <p className="text-sm text-purple-300">${scannedCoin.symbol}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Verifiable
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-mono mt-2 break-all">
                                    {scannedCoin.address}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-3">Select Boost Plan</h3>
                        <div className="space-y-4">
                            {boostPackages.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => handlePurchase(pkg)}
                                    disabled={isPurchasing}
                                    className="w-full text-left group"
                                >
                                    <div className={`bg-gradient-to-br ${pkg.color} rounded-2xl p-4 relative overflow-hidden transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]`}>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                                    {pkg.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{pkg.name}</h3>
                                                    <p className="text-xs text-white/80">{pkg.duration} mins on King of Hill</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-white">${pkg.price}</p>
                                            </div>
                                        </div>

                                        {purchasingId === pkg.id && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                                <div className="flex flex-col items-center animate-pulse">
                                                    <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                                                    <span className="text-white font-bold">Boosting...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Boosts Feed */}
                {activeBoosts.length > 0 && (
                    <div className="mt-8 border-t border-gray-800 pt-6">
                        <h2 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" /> Current Kings of the Hill
                        </h2>
                        <div className="space-y-3">
                            {activeBoosts.map((boost) => (
                                <div
                                    key={boost.id}
                                    className="bg-gray-900/30 rounded-xl p-3 flex items-center justify-between border border-gray-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400">
                                            {boost.coins?.symbol?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">
                                                ${boost.coins?.symbol || "Unknown"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate w-24">
                                                {boost.coins?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                                            {getTimeRemaining(boost.expires_at)} left
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
