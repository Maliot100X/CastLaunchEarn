import { type Address, type WalletClient, type PublicClient, parseEther } from 'viem';
import { base, zora } from 'viem/chains';

// Coin creation parameters
export interface CreateCoinParams {
    name: string;
    symbol: string;
    uri: string;
    payoutRecipient: Address;
    platformReferrer?: Address;
    chainId?: number; // Optional target chain ID
}

// Create a new coin using Zora Coins SDK
export async function createUserCoin(
    params: CreateCoinParams,
    walletClient: WalletClient,
    publicClient: PublicClient
) {
    // Validate inputs
    if (!walletClient) {
        throw new Error('Wallet client not connected');
    }
    if (!publicClient) {
        throw new Error('Public client not available');
    }

    // Dynamically import to avoid SSR issues
    const CoinsSDK = await import('@zoralabs/coins-sdk');

    const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
    if (zoraApiKey && CoinsSDK.setApiKey) {
        CoinsSDK.setApiKey(zoraApiKey);
    }

    // Determine target chain
    const targetChainId = params.chainId || 8453; // Default to Base
    const targetChain = targetChainId === 7777777 ? zora : base;

    console.log(`[createUserCoin] Target Chain: ${targetChain.name} (${targetChainId})`);

    // Ensure clients have the correct chain attached
    // Ensure clients have the correct chain attached
    // This fixes the "Client network needs to be base" error
    const publicClientWithChain = {
        ...publicClient,
        chain: targetChain,
    };

    // For wallet client, we strictly check it exists (validated above) and attach chain
    const walletClientWithChain = {
        ...walletClient,
        chain: targetChain
    };

    const coinParams = {
        name: params.name,
        symbol: params.symbol,
        uri: params.uri as `ipfs://${string}` | `https://${string}`,
        payoutRecipient: params.payoutRecipient,
        platformReferrer: params.platformReferrer || (process.env.NEXT_PUBLIC_PLATFORM_WALLET as Address) || '0xccd1e099590bfedf279e239558772bbb50902ef6' as Address,
        chainId: targetChainId,
        publicClient: publicClientWithChain as any,
        walletClient: walletClientWithChain as any,
    };

    console.log('[createUserCoin] Params:', JSON.stringify({ ...coinParams, walletClient: 'HIDDEN', publicClient: 'HIDDEN' }, null, 2));

    try {
        // Create the coin - SDK handles the deployment
        const result = await (CoinsSDK.createCoin as any)(coinParams);
        console.log('[createUserCoin] Success:', result);

        return {
            address: (result as any).address || (result as any).coinAddress || '',
            hash: (result as any).hash || (result as any).transactionHash || '',
            deployment: (result as any).deployment,
        };
    } catch (error) {
        console.error('[createUserCoin] SDK Error:', error);
        throw error;
    }
}

// Trade parameters for buy/sell
export interface TradeUserCoinParams {
    coinAddress: Address;
    amount: string; // ETH amount as string
    isBuy: boolean;
    sender: Address;
}

// Trade coins (buy or sell)
export async function tradeUserCoin(
    params: TradeUserCoinParams,
    walletClient: WalletClient,
    publicClient: PublicClient,
    account: Address
) {
    // Dynamically import to avoid SSR issues
    const CoinsSDK = await import('@zoralabs/coins-sdk');

    const zoraApiKey = process.env.NEXT_PUBLIC_ZORA_API_KEY;
    if (zoraApiKey && CoinsSDK.setApiKey) {
        CoinsSDK.setApiKey(zoraApiKey);
    }

    const amountInWei = parseEther(params.amount);

    // Ensure we have chain info
    const publicClientWithChain = {
        ...publicClient,
        chain: publicClient.chain || base,
    };

    const walletClientWithChain = {
        ...walletClient,
        chain: walletClient.chain || base,
    };

    const tradeParameters = {
        sell: params.isBuy
            ? { type: "eth" as const }
            : { type: "erc20" as const, address: params.coinAddress },
        buy: params.isBuy
            ? { type: "erc20" as const, address: params.coinAddress }
            : { type: "eth" as const },
        amountIn: amountInWei,
        slippage: 0.05, // 5% slippage tolerance
        sender: params.sender,
    };

    const result = await (CoinsSDK.tradeCoin as any)({
        tradeParameters,
        walletClient: walletClientWithChain as any,
        account: { address: account, type: 'json-rpc' },
        publicClient: publicClientWithChain as any,
    });

    return result;
}
