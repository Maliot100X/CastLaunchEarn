// Get newly created coins
export async function getNewCoins(count: number = 20) {
    try {
        const { getCoinsNew, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await getCoinsNew({ count });
        return response;
    } catch (error) {
        console.error('Error fetching new coins:', error);
        return { data: { exploreList: { edges: [] } } };
    }
}

// Get trending coins (top volume 24h)
export async function getTrendingCoins(count: number = 20) {
    try {
        const { getCoinsTopVolume24h, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await getCoinsTopVolume24h({ count });
        return response;
    } catch (error) {
        console.error('Error fetching trending coins:', error);
        return { data: { exploreList: { edges: [] } } };
    }
}

// Get top gainers (24h)
export async function getTopGainers(count: number = 20) {
    try {
        const { getCoinsTopGainers, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await getCoinsTopGainers({ count });
        return response;
    } catch (error) {
        console.error('Error fetching top gainers:', error);
        return { data: { exploreList: { edges: [] } } };
    }
}

// Get most valuable coins
export async function getMostValuableCoins(count: number = 20) {
    try {
        const { getCoinsMostValuable, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await getCoinsMostValuable({ count });
        return response;
    } catch (error) {
        console.error('Error fetching most valuable coins:', error);
        return { data: { exploreList: { edges: [] } } };
    }
}

// Get details for a specific coin
export async function getCoinDetails(address: string, chainId: number = 8453) {
    try {
        const { getCoin, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await getCoin({ address, chain: chainId });
        return response;
    } catch (error) {
        console.error('Error fetching coin details:', error);
        return null;
    }
}

// Get coin holders
export async function getCoinHolders(address: string, chainId: number = 8453, count: number = 50) {
    try {
        const { getCoinHolders: fetchHolders, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await fetchHolders({ address, chainId, count });
        return response;
    } catch (error) {
        console.error('Error fetching coin holders:', error);
        return { data: { zora20Token: { holders: { edges: [] } } } };
    }
}

// Get profile coins created
export async function getProfileCoins(identifier: string, count: number = 50) {
    try {
        const { getProfileCoins: fetchCoins, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await fetchCoins({ identifier, count });
        return response;
    } catch (error) {
        console.error('Error fetching profile coins:', error);
        return { data: { profile: { coinsCreated: { edges: [] } } } };
    }
}

// Get profile balances
export async function getProfileBalances(identifier: string, count: number = 50) {
    try {
        const { getProfileBalances: fetchBalances, setApiKey } = await import('@zoralabs/coins-sdk');
        const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
        if (zoraApiKey) {
            setApiKey(zoraApiKey);
        }
        const response = await fetchBalances({ identifier, count });
        return response;
    } catch (error) {
        console.error('Error fetching profile balances:', error);
        return { data: { profile: { coinBalances: { edges: [] } } } };
    }
}
