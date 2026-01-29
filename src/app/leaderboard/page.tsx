"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Gift, RefreshCw } from "lucide-react";
import { supabase, type LeaderboardEntry, type User } from "@/lib/supabase";
import { formatNumber } from "@/lib/utils";

type Period = "weekly" | "monthly";

interface LeaderboardUser extends User {
    rank: number;
    total_score: number;
}

export default function LeaderboardPage() {
    const [period, setPeriod] = useState<Period>("weekly");
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLeaderboard = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('score', { ascending: false })
                .limit(50);

            if (data) {
                setLeaders(data.map((user: User, idx: number) => ({
                    ...user,
                    rank: idx + 1,
                    total_score: user.score,
                })));
            }
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [period]);

    const prizes = [
        { rank: 1, prize: "$50", emoji: "🥇", color: "from-yellow-400 to-yellow-600" },
        { rank: 2, prize: "$25", emoji: "🥈", color: "from-gray-300 to-gray-500" },
        { rank: 3, prize: "Free Boost", emoji: "🥉", color: "from-orange-400 to-orange-600" },
    ];

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                        <p className="text-sm text-gray-400">Top creators & traders</p>
                    </div>
                    <button
                        onClick={fetchLeaderboard}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Period Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setPeriod("weekly")}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${period === "weekly"
                            ? "bg-purple-600 text-white"
                            : "bg-white/5 text-gray-400"
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod("monthly")}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${period === "monthly"
                            ? "bg-purple-600 text-white"
                            : "bg-white/5 text-gray-400"
                            }`}
                    >
                        Monthly
                    </button>
                </div>

                {/* Prizes Banner */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {prizes.map((p) => (
                        <div
                            key={p.rank}
                            className={`bg-gradient-to-br ${p.color} rounded-xl p-3 text-center`}
                        >
                            <div className="text-2xl crown-bounce">{p.emoji}</div>
                            <div className="text-xs font-bold text-black/80">#{p.rank}</div>
                            <div className="text-sm font-bold text-black">{p.prize}</div>
                        </div>
                    ))}
                </div>

                {/* Top 3 Podium */}
                {!isLoading && leaders.length >= 3 && (
                    <div className="flex items-end justify-center gap-2 mb-6 h-40">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center w-24">
                            <img
                                src={leaders[1]?.pfp_url || "/default-avatar.png"}
                                alt={leaders[1]?.username || "User"}
                                className="w-12 h-12 rounded-full border-2 border-gray-400 mb-1"
                            />
                            <span className="text-xs text-gray-300 truncate w-full text-center">
                                @{leaders[1]?.username || "anon"}
                            </span>
                            <div className="w-full h-20 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg flex items-end justify-center pb-2">
                                <span className="text-2xl">🥈</span>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center w-24">
                            <img
                                src={leaders[0]?.pfp_url || "/default-avatar.png"}
                                alt={leaders[0]?.username || "User"}
                                className="w-14 h-14 rounded-full border-2 border-yellow-400 mb-1"
                            />
                            <span className="text-xs text-gray-300 truncate w-full text-center">
                                @{leaders[0]?.username || "anon"}
                            </span>
                            <div className="w-full h-28 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                                <span className="text-3xl crown-bounce">👑</span>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center w-24">
                            <img
                                src={leaders[2]?.pfp_url || "/default-avatar.png"}
                                alt={leaders[2]?.username || "User"}
                                className="w-12 h-12 rounded-full border-2 border-orange-400 mb-1"
                            />
                            <span className="text-xs text-gray-300 truncate w-full text-center">
                                @{leaders[2]?.username || "anon"}
                            </span>
                            <div className="w-full h-16 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg flex items-end justify-center pb-2">
                                <span className="text-2xl">🥉</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scoring Info */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        How Scoring Works
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>🪙 Create coin: +10 pts</li>
                        <li>📈 Trading volume: +1 pt per $10</li>
                        <li>👥 Per holder: +2 pts</li>
                        <li>📤 Cast share: +5 pts</li>
                        <li>📅 Days active: +1 pt/day</li>
                    </ul>
                </div>

                {/* Full Leaderboard */}
                <div className="bg-gray-900/50 rounded-2xl overflow-hidden">
                    <div className="p-3 border-b border-white/10">
                        <span className="text-sm font-medium text-gray-400">All Rankings</span>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading...
                        </div>
                    ) : leaders.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No users yet. Be the first!
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {leaders.map((user) => (
                                <div
                                    key={user.fid}
                                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                                >
                                    <span className={`w-8 text-center font-bold ${user.rank <= 3 ? "text-yellow-400" : "text-gray-500"
                                        }`}>
                                        #{user.rank}
                                    </span>
                                    <img
                                        src={user.pfp_url || "/default-avatar.png"}
                                        alt={user.username || "User"}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">
                                            {user.display_name || user.username || "Anonymous"}
                                        </p>
                                        <p className="text-xs text-gray-400">@{user.username || "unknown"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-purple-400">{formatNumber(user.total_score)}</p>
                                        <p className="text-xs text-gray-500">points</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
