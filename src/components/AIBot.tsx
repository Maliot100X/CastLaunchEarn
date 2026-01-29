"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AIBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hey! 👋 I'm CastBot, your AI assistant. I can help you create coins, check stats, or answer questions about CastLaunchEarn. What would you like to do?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'chat', message: userMessage }),
            });
            const data = await response.json();
            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.response || "Sorry, I couldn't understand that."
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I had trouble processing that. Please try again!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCoin = async () => {
        setIsLoading(true);
        setMessages(prev => [...prev, { role: "user", content: "Generate a coin idea for me! 🎲" }]);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' }),
            });
            const data = await response.json();
            if (data.idea) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: `Here's a fresh coin idea for you! 🚀\n\n**Name:** ${data.idea.name}\n**Symbol:** $${data.idea.symbol}\n**Description:** ${data.idea.description}\n\n💡 Want me to generate another one?`
                }]);
            } else {
                throw new Error('No idea generated');
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Hmm, couldn't generate an idea right now. Try again!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">CastBot</h3>
                                    <p className="text-xs text-green-400">Online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === "user"
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-800 text-gray-100"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 rounded-2xl px-4 py-3">
                                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="px-4 py-2 border-t border-white/10">
                            <button
                                onClick={handleGenerateCoin}
                                disabled={isLoading}
                                className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 text-sm font-medium hover:from-purple-600/30 hover:to-pink-600/30 transition-all disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4 inline mr-2" />
                                Generate Coin Idea
                            </button>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 rounded-xl bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-500 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </>
    );
}
