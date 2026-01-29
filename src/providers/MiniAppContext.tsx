"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import sdk from "@farcaster/miniapp-sdk";

interface FarcasterUser {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    custody?: string;
}

interface FarcasterContextType {
    context: any;
    user: FarcasterUser | null;
    isLoading: boolean;
    error: string | null;
    isInMiniApp: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
    context: null,
    user: null,
    isLoading: true,
    error: null,
    isInMiniApp: false,
});

export const useMiniApp = () => useContext(FarcasterContext);

export function MiniAppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<FarcasterContextType>({
        context: null,
        user: null,
        isLoading: true,
        error: null,
        isInMiniApp: false,
    });

    useEffect(() => {
        const initializeSDK = async () => {
            try {
                // Check if we're in a Farcaster Mini App context
                const sdkContext = await sdk.context;

                if (sdkContext?.user) {
                    // We're in a Mini App
                    setState({
                        context: sdkContext,
                        user: {
                            fid: sdkContext.user.fid,
                            username: sdkContext.user.username,
                            displayName: sdkContext.user.displayName,
                            pfpUrl: sdkContext.user.pfpUrl,
                        },
                        isLoading: false,
                        error: null,
                        isInMiniApp: true,
                    });

                    // Signal that we're ready
                    await sdk.actions.ready();

                    // Enable web navigation for back button
                    try {
                        await sdk.back.enableWebNavigation();
                    } catch (e) {
                        console.log("Web navigation not available");
                    }
                } else {
                    // Not in a Mini App, but that's okay for web testing
                    setState({
                        context: null,
                        user: null,
                        isLoading: false,
                        error: null,
                        isInMiniApp: false,
                    });
                }
            } catch (error) {
                console.log("Not in Farcaster Mini App context:", error);
                // Not an error - just not in Mini App context
                setState({
                    context: null,
                    user: null,
                    isLoading: false,
                    error: null,
                    isInMiniApp: false,
                });
            }
        };

        initializeSDK();
    }, []);

    return (
        <FarcasterContext.Provider value={state}>
            {children}
        </FarcasterContext.Provider>
    );
}

// Hook to trigger Farcaster sign in
export function useFarcasterAuth() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const signIn = async () => {
        setIsAuthenticating(true);
        setAuthError(null);

        try {
            await sdk.actions.signIn({
                nonce: crypto.randomUUID(),
                acceptAuthAddress: true,
            });

            const context = await sdk.context;
            if (context?.user) {
                return {
                    fid: context.user.fid,
                    username: context.user.username,
                    displayName: context.user.displayName,
                    pfpUrl: context.user.pfpUrl,
                };
            }
            throw new Error("Sign in failed");
        } catch (error: any) {
            setAuthError(error.message || "Sign in failed");
            return null;
        } finally {
            setIsAuthenticating(false);
        }
    };

    return { signIn, isAuthenticating, authError };
}

// Hook to cast to Farcaster
export function useCast() {
    const cast = async (text: string, embeds?: string[]) => {
        try {
            await sdk.actions.composeCast({
                text,
                embeds: embeds?.map(url => ({ url })) as any,
            });
            return true;
        } catch (error) {
            console.error("Cast failed:", error);
            return false;
        }
    };

    return { cast };
}

// Hook to view a profile
export function useViewProfile() {
    const viewProfile = async (fid: number) => {
        try {
            await sdk.actions.viewProfile({ fid });
            return true;
        } catch (error) {
            console.error("View profile failed:", error);
            return false;
        }
    };

    return { viewProfile };
}
