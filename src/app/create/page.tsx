"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient, useConnect } from "wagmi";
import { useMiniApp, useCast } from "@/providers/MiniAppContext";
import { Sparkles, Upload, Loader2, ExternalLink, Share2, Wallet } from "lucide-react";
import { createUserCoin } from "@/lib/coins";
import { createCoinMetadata } from "@/lib/pinata";
import { supabase } from "@/lib/supabase";
import type { Address } from "viem";

type Step = "form" | "creating" | "success";

export default function CreatePage() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { user } = useMiniApp();
    const { cast } = useCast();

    const [step, setStep] = useState<Step>("form");
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{
        address: string;
        hash: string;
    } | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' }),
            });
            const data = await response.json();
            if (data.idea) {
                setName(data.idea.name);
                setSymbol(data.idea.symbol);
                setDescription(data.idea.description);

                if (data.idea.imageUrl) {
                    setImagePreview(data.idea.imageUrl);
                    // Convert URL to File object for upload
                    try {
                        const imgRes = await fetch(data.idea.imageUrl);
                        const blob = await imgRes.blob();
                        const file = new File([blob], "generated-coin-image.png", { type: "image/png" });
                        setImageFile(file);
                    } catch (e) {
                        console.error("Failed to process generated image:", e);
                    }
                }
            }
        } catch (err) {
            console.error("Generation failed:", err);
            setError("AI generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConnect = (connectorId: string) => {
        const connector = connectors.find((c) => c.id === connectorId);
        if (connector) {
            connect({ connector });
        }
    };

    // Launch Type State
    const [launchType, setLaunchType] = useState<"zora" | "base">("zora");

    const handleCreate = async () => {
        if (!name || !symbol || !isConnected || !walletClient || !publicClient) {
            setError("Please fill all fields and connect your wallet");
            return;
        }

        setError(null);
        setIsCreating(true);
        setStep("creating");

        try {
            // 1. Upload metadata to IPFS
            const metadataUri = await createCoinMetadata({
                name,
                symbol,
                description,
                imageFile: imageFile || undefined,
            });

            // 2. Create coin on-chain
            let coinResult;

            // Define chain IDs
            const BASE_CHAIN_ID = 8453;
            const ZORA_CHAIN_ID = 7777777;

            const targetChainId = launchType === "zora" ? ZORA_CHAIN_ID : BASE_CHAIN_ID;

            console.log(`Launching on ${launchType} -> Chain ID: ${targetChainId}`);

            if (!walletClient || !publicClient) {
                alert("Please connect your wallet first");
                setIsCreating(false);
                return;
            }

            // Call createUserCoin with the specific target chain
            coinResult = await createUserCoin(
                {
                    name,
                    symbol,
                    uri: metadataUri,
                    payoutRecipient: address as Address,
                    chainId: targetChainId
                },
                walletClient,
                publicClient
            );

            // 3. Save to database
            if (user?.fid) {
                await supabase.from('coins').insert({
                    creator_fid: user.fid,
                    coin_address: coinResult.address,
                    name,
                    symbol,
                    description,
                    image_url: imagePreview,
                    tx_hash: coinResult.hash,
                });
                // ... score update
            }

            setResult({
                address: coinResult.address,
                hash: coinResult.hash,
            });
            setStep("success");
        } catch (err: any) {
            console.error("Creation failed:", err);
            setError(err.message || "Failed to create coin");
            setStep("form");
        } finally {
            setIsCreating(false);
        }
    };

    const handleShare = async () => {
        if (!result) return;

        const text = `🚀 Just launched $${symbol} on @CastLaunchEarn!

${name}: ${description}

Trade now on Base 👇
https://zora.co/coin/base:${result.address}`;

        await cast(text);
    };

    // Success Screen
    if (step === "success" && result) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Coin Created!</h1>
                    <p className="text-gray-400 mb-6">
                        Your coin <span className="text-purple-400">${symbol}</span> is now live on Base!
                    </p>

                    <div className="bg-gray-900/50 rounded-2xl p-4 mb-6 text-left">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-400">Contract</span>
                            <a
                                href={`https://basescan.org/address/${result.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 text-sm flex items-center gap-1 hover:underline"
                            >
                                {result.address.slice(0, 8)}...{result.address.slice(-6)}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Transaction</span>
                            <a
                                href={`https://basescan.org/tx/${result.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 text-sm flex items-center gap-1 hover:underline"
                            >
                                View on BaseScan
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleShare}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Share2 className="w-5 h-5" />
                            Share to Farcaster
                        </button>
                        <a
                            href={`https://zora.co/coin/base:${result.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 rounded-xl bg-white/10 text-white font-medium text-center hover:bg-white/20 transition-colors"
                        >
                            View on Zora
                        </a>
                        <button
                            onClick={() => {
                                setStep("form");
                                setName("");
                                setSymbol("");
                                setDescription("");
                                setImageFile(null);
                                setImagePreview(null);
                                setResult(null);
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Create Another Coin
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Creating Screen
    if (step === "creating") {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Creating Your Coin...</h2>
                    <p className="text-gray-400 text-sm">
                        Please confirm the transaction in your wallet
                    </p>
                </div>
            </div>
        );
    }

    // Form Screen
    return (
        <div className="min-h-screen p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-white mb-2">Create Coin</h1>
                <p className="text-gray-400 mb-6">Launch your token on Base</p>

                {/* Launch Mode Selector */}
                <div className="flex gap-2 mb-6 p-1 bg-gray-800 rounded-xl">
                    <button
                        onClick={() => setLaunchType("base")}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${launchType === "base"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        🚀 Launch on Base
                    </button>
                    <button
                        onClick={() => setLaunchType("zora")}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${launchType === "zora"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        orb Launch on Zora
                    </button>
                </div>

                {/* Wallet Connection if not connected */}
                {!isConnected && (
                    <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-purple-400" />
                            Connect Wallet to Start
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {/* Specific Buttons for MetaMask and Coinbase */}
                            <button
                                onClick={() => handleConnect('metaMask')}
                                className="w-full py-2 px-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" className="w-5 h-5" alt="MetaMask" />
                                Connect MetaMask
                            </button>
                            <button
                                onClick={() => handleConnect('coinbaseWalletSDK')}
                                className="w-full py-2 px-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <img src="https://avatars.githubusercontent.com/u/18060234?s=200&v=4" className="w-5 h-5" alt="Coinbase" />
                                Connect Coinbase Wallet
                            </button>
                            {/* Fallback for others */}
                            <button
                                onClick={() => handleConnect('injected')}
                                className="w-full py-2 px-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                            >
                                Other Wallets
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full mb-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 font-medium flex items-center justify-center gap-2 hover:from-purple-600/30 hover:to-pink-600/30 transition-all disabled:opacity-50"
                >
                    {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Sparkles className="w-5 h-5" />
                    )}
                    Generate with AI
                </button>

                {/* Form */}
                <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Coin Image
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition-colors overflow-hidden">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-sm">Click to upload</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Coin Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Moon Rocket"
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    {/* Symbol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Symbol * (2-5 characters)
                        </label>
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase().slice(0, 5))}
                            placeholder="e.g. MOON"
                            maxLength={5}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's your coin about?"
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Create Button */}
                    {!isConnected ? (
                        <div className="text-center py-4 text-gray-400">
                            Connect wallet above to continue
                        </div>
                    ) : (
                        <button
                            onClick={handleCreate}
                            disabled={!name || !symbol || isCreating}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating ? "Creating..." : "Create Coin 🚀"}
                        </button>
                    )}


                </div>
            </div>
        </div>
    );
}
