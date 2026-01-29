"use client";

import { formatNumber, formatAddress } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CoinCardProps {
    name: string;
    symbol: string;
    address: string;
    imageUrl?: string;
    price?: number;
    priceChange24h?: number;
    volume24h?: number;
    holders?: number;
    creatorName?: string;
    creatorPfp?: string;
    isBoosted?: boolean;
    onClick?: () => void;
}

export default function CoinCard({
    name,
    symbol,
    address,
    imageUrl,
    price,
    priceChange24h,
    volume24h,
    holders,
    creatorName,
    creatorPfp,
    isBoosted,
    onClick,
}: CoinCardProps) {
    const isPositive = (priceChange24h || 0) >= 0;

    return (
        <div
            onClick={onClick}
            className={`relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${isBoosted
                    ? "border-yellow-500/50 shadow-yellow-500/20 shadow-lg"
                    : "border-white/10 hover:border-purple-500/50"
                }`}
        >
            {/* Boosted Badge */}
            {isBoosted && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    🔥 BOOSTED
                </div>
            )}

            {/* Header with Image and Name */}
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                            {symbol.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{name}</h3>
                    <p className="text-sm text-gray-400">${symbol}</p>
                </div>
                <Link
                    href={`https://basescan.org/token/${address}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                </Link>
            </div>

            {/* Price and Change */}
            {price !== undefined && (
                <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-white">
                        ${formatNumber(price)}
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"
                        }`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(priceChange24h || 0).toFixed(2)}%
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm text-gray-400">
                {volume24h !== undefined && (
                    <span>Vol: ${formatNumber(volume24h)}</span>
                )}
                {holders !== undefined && (
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {holders}
                    </span>
                )}
            </div>

            {/* Creator */}
            {creatorName && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    {creatorPfp ? (
                        <img src={creatorPfp} alt={creatorName} className="w-5 h-5 rounded-full" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-700" />
                    )}
                    <span className="text-xs text-gray-400">by {creatorName}</span>
                </div>
            )}
        </div>
    );
}
