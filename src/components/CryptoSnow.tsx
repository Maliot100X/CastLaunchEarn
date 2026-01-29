"use client";

import { useEffect, useState } from "react";

const COINS = ["₿", "Ξ", "Ɖ", "🐸", "🚀", "🌕", "💎"];

export default function CryptoSnow() {
    const [snowflakes, setSnowflakes] = useState<{ id: number; left: number; duration: number; delay: number; char: string }[]>([]);

    useEffect(() => {
        const createSnowflake = () => {
            const id = Date.now();
            const left = Math.random() * 100; // 0-100vw
            const duration = Math.random() * 5 + 5; // 5-10s
            const delay = Math.random() * 5;
            const char = COINS[Math.floor(Math.random() * COINS.length)];

            setSnowflakes((prev) => [...prev, { id, left, duration, delay, char }]);

            // Remove snowflake after animation
            setTimeout(() => {
                setSnowflakes((prev) => prev.filter((s) => s.id !== id));
            }, (duration + delay) * 1000);
        };

        const interval = setInterval(createSnowflake, 500); // New snowflake every 500ms
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-0 text-white/10 text-xl select-none animate-fall"
                    style={{
                        left: `${flake.left}vw`,
                        animationDuration: `${flake.duration}s`,
                        animationDelay: `${flake.delay}s`,
                    }}
                >
                    {flake.char}
                </div>
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.5; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                .animate-fall {
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
}
