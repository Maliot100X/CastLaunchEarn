"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Trophy, ShoppingBag, User, MoreHorizontal } from "lucide-react";

const tabs = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/create", icon: PlusCircle, label: "Create" },
    { href: "/leaderboard", icon: Trophy, label: "Rank" },
    { href: "/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/more", icon: MoreHorizontal, label: "More" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-xl border-t border-white/10">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${isActive
                                    ? "text-purple-400"
                                    : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            <div className={`relative ${isActive ? "scale-110" : ""}`}>
                                <Icon className="w-5 h-5" />
                                {isActive && (
                                    <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-md -z-10" />
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-purple-300" : ""}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
