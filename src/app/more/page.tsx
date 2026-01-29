"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMiniApp } from "@/providers/MiniAppContext";
import {
    Crown, HelpCircle, Settings, Info, Gift,
    Loader2, Check, ExternalLink, ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MorePage() {
    const { address, isConnected } = useAccount();
    const { user } = useMiniApp();

    const [isSubscriber, setIsSubscriber] = useState(false);
    const [subscriptionExpires, setSubscriptionExpires] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.fid) {
            checkSubscription();
        }
    }, [user?.fid]);

    const checkSubscription = async () => {
        if (!user?.fid) return;

        const { data } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_fid', user.fid)
            .eq('is_active', true)
            .single();

        if (data) {
            setIsSubscriber(true);
            setSubscriptionExpires(data.expires_at);
        }
    };

    const handleSubscribe = async (plan: 'trial' | 'monthly') => {
        if (!user?.fid) return;
        setIsLoading(true);

        try {
            const amount = plan === 'trial' ? 1 : 15;
            const durationDays = plan === 'trial' ? 7 : 30;

            // In a real app, you'd integrate Stripe or crypto payments here
            // For now, we'll just create the subscription
            const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

            await supabase.from('subscriptions').insert({
                user_fid: user.fid,
                plan,
                amount_usd: amount,
                expires_at: expiresAt.toISOString(),
                is_active: true,
            });

            // Update user
            await supabase.from('users').update({
                is_subscriber: true,
                subscriber_since: new Date().toISOString(),
            }).eq('fid', user.fid);

            setIsSubscriber(true);
            setSubscriptionExpires(expiresAt.toISOString());
            alert(`🎉 Welcome to Premium! You're subscribed until ${expiresAt.toLocaleDateString()}`);
        } catch (err) {
            console.error("Subscription failed:", err);
            alert("Subscription failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const menuItems = [
        {
            icon: <HelpCircle className="w-5 h-5" />,
            label: "Help & FAQ",
            href: "#faq"
        },
        {
            icon: <Settings className="w-5 h-5" />,
            label: "Settings",
            href: "#settings"
        },
        {
            icon: <Info className="w-5 h-5" />,
            label: "About CastLaunchEarn",
            href: "#about"
        },
        {
            icon: <ExternalLink className="w-5 h-5" />,
            label: "View on GitHub",
            href: "https://github.com/Maliot100X/CastLaunchEarn",
            external: true
        },
    ];

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">More</h1>

                {/* Subscription Card */}
                <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-2xl p-6 mb-6 border border-yellow-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Premium Membership</h2>
                            <p className="text-sm text-yellow-300/80">Unlock exclusive features</p>
                        </div>
                    </div>

                    {isSubscriber ? (
                        <div className="bg-green-500/20 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 text-green-400 font-medium">
                                <Check className="w-5 h-5" />
                                You're a Premium member!
                            </div>
                            <p className="text-sm text-gray-300 mt-1">
                                Expires: {subscriptionExpires ? new Date(subscriptionExpires).toLocaleDateString() : "Never"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Special ⭐ badge on profile
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-green-400" />
                                    1 free boost per month
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Priority customer support
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Early access to new features
                                </li>
                            </ul>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleSubscribe('trial')}
                                    disabled={isLoading || !user}
                                    className="py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        <>
                                            <span className="block text-lg font-bold">$1</span>
                                            <span className="text-xs text-gray-400">7-day trial</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleSubscribe('monthly')}
                                    disabled={isLoading || !user}
                                    className="py-3 rounded-xl bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        <>
                                            <span className="block text-lg font-bold">$15</span>
                                            <span className="text-xs">per month</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Platform Stats */}
                <div className="bg-gray-900/50 rounded-2xl p-4 mb-6">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-400" />
                        Platform Stats
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-xl font-bold text-white">1,234</p>
                            <p className="text-xs text-gray-400">Total Coins</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">5,678</p>
                            <p className="text-xs text-gray-400">Users</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">$1.2M</p>
                            <p className="text-xs text-gray-400">Volume</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="bg-gray-900/50 rounded-2xl overflow-hidden">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                            <span className="text-gray-400">{item.icon}</span>
                            <span className="flex-1 text-white">{item.label}</span>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </a>
                    ))}
                </div>

                {/* FAQ Section */}
                <div id="faq" className="mt-6">
                    <h3 className="font-bold text-white mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                        <details className="bg-gray-900/50 rounded-xl p-4">
                            <summary className="font-medium text-white cursor-pointer">
                                How do I create a coin?
                            </summary>
                            <p className="mt-2 text-sm text-gray-400">
                                Go to the Create tab, fill in your coin details (or use AI to generate),
                                upload an image, and click Create. You'll need ETH for gas fees.
                            </p>
                        </details>
                        <details className="bg-gray-900/50 rounded-xl p-4">
                            <summary className="font-medium text-white cursor-pointer">
                                How does boosting work?
                            </summary>
                            <p className="mt-2 text-sm text-gray-400">
                                Boosts promote your coin in the "King of Hill" section. Choose a boost package
                                in the Shop tab, pay with ETH, and your coin gets featured for the duration.
                            </p>
                        </details>
                        <details className="bg-gray-900/50 rounded-xl p-4">
                            <summary className="font-medium text-white cursor-pointer">
                                How are leaderboard scores calculated?
                            </summary>
                            <p className="mt-2 text-sm text-gray-400">
                                Scores are based on: coins created (10 pts each), trading volume
                                (1 pt per $10), holders (2 pts each), shares (5 pts), and activity.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>CastLaunchEarn v1.0.0</p>
                    <p className="mt-1">Built with ❤️ on Base</p>
                </div>
            </div>
        </div>
    );
}
