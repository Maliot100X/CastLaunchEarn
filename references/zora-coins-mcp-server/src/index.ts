#!/usr/bin/env node
import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Zora Coins SDK
import * as CoinsSDK from "@zoralabs/coins-sdk";

import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  parseUnits,
} from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const SERVER_NAME = "zora-coins-mcp";
const SERVER_VERSION = "0.1.0";

// ---- Env and clients ----
const apiKey = process.env.ZORA_API_KEY;
if (apiKey) {
  try {
    CoinsSDK.setApiKey(apiKey);
  } catch (err) {
    console.error("Failed to set Zora API key:", err);
  }
}

const DEFAULT_CHAIN = base;
const chainId = Number(process.env.CHAIN_ID || DEFAULT_CHAIN.id);
const baseRpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";

const publicClient = createPublicClient({
  chain: DEFAULT_CHAIN,
  transport: http(baseRpcUrl),
});

const privateKeyRaw = (process.env.PRIVATE_KEY || "").trim();
const hasWallet = !!privateKeyRaw;
const normalizedPk = hasWallet
  ? (privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`)
  : "";
const account = hasWallet ? privateKeyToAccount(normalizedPk as `0x${string}`) : undefined;
const walletClient = hasWallet
  ? createWalletClient({
      account,
      chain: DEFAULT_CHAIN,
      transport: http(baseRpcUrl),
    })
  : undefined;

function ensureWallet() {
  if (!walletClient || !account) {
    throw new Error(
      "Write operation requires PRIVATE_KEY and BASE_RPC_URL. Set them in your environment and restart the server."
    );
  }
}

function json(data: unknown): string {
  return JSON.stringify(
    data,
    (_k, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
}

// ---- MCP server ----
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

// Diagnostics
server.registerTool(
  "zora_health",
  {
    title: "Zora Coins server health",
    description:
      "Returns server and environment diagnostics (API key present, wallet, RPC, chain).",
    inputSchema: {},
  },
  async () => {
    const res = {
      server: { name: SERVER_NAME, version: SERVER_VERSION },
      apiKeyConfigured: !!apiKey,
      rpcUrl: baseRpcUrl,
      chainId,
      walletAddress: account?.address || null,
    };
    return { content: [{ type: "text", text: json(res) }] };
  }
);

// ---- Read tools (Queries) ----
server.registerTool(
  "zora_get_coin",
  {
    title: "Get coin details",
    description: "Fetch metadata, market data & creator info for a coin.",
    inputSchema: {
      address: z.string().min(1, "address is required"),
      chainId: z.number().optional(),
    },
  },
  async ({ address, chainId }) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getCoin({ address, chain: chainId ?? DEFAULT_CHAIN.id });
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

server.registerTool(
  "zora_get_coins",
  {
    title: "Get multiple coins",
    description: "Batch fetch coins by address and chainId.",
    inputSchema: {
      coins: z
        .array(
          z.object({
            collectionAddress: z.string(),
            chainId: z.number().default(DEFAULT_CHAIN.id),
          })
        )
        .min(1),
    },
  },
  async ({ coins }) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getCoins({ coins });
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

server.registerTool(
  "zora_get_coin_holders",
  {
    title: "Get coin holders",
    description: "List holders of a coin with balances and profile data.",
    inputSchema: {
      address: z.string(),
      chainId: z.number().default(DEFAULT_CHAIN.id),
      after: z.string().optional(),
      count: z.number().int().min(1).max(100).optional(),
    },
  },
  async ({ address, chainId, after, count }) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getCoinHolders({
      address,
      chainId,
      after,
      count,
    });
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

server.registerTool(
  "zora_get_coin_swaps",
  {
    title: "Get coin swaps",
    description: "Fetch recent buy/sell swap activity for a coin.",
    inputSchema: {
      address: z.string(),
      chainId: z.number().default(DEFAULT_CHAIN.id),
      after: z.string().optional(),
      first: z.number().int().min(1).max(100).optional(),
    },
  },
  async ({ address, chainId, after, first }) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getCoinSwaps({
      address,
      chain: chainId,
      after,
      first,
    });
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

server.registerTool(
  "zora_get_coin_comments",
  {
    title: "Get coin comments",
    description: "Fetch comments associated with a coin (paginated).",
    inputSchema: {
      address: z.string(),
      chainId: z.number().default(DEFAULT_CHAIN.id),
      after: z.string().optional(),
      count: z.number().int().min(1).max(100).optional(),
    },
  },
  async ({ address, chainId, after, count }) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getCoinComments({
      address,
      chain: chainId,
      after,
      count,
    });
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

server.registerTool(
  "zora_get_profile",
  {
    title: "Get profile",
    description: "Fetch profile for a wallet or @handle.",
    inputSchema: {
      identifier: z.string().min(1, "identifier (wallet or handle) is required"),
    },
  },
  async ({ identifier }) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getProfile({ identifier });
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

server.registerTool(
  "zora_get_profile_coins",
  {
    title: "Get profile-created coins",
    description: "List coins created by a profile.",
    inputSchema: {
      identifier: z.string(),
      count: z.number().int().min(1).max(100).optional(),
      after: z.string().optional(),
      chainIds: z.array(z.number()).optional(),
      platformReferrerAddress: z.array(z.string()).optional(),
    },
  },
  async (args) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getProfileCoins(args);
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

server.registerTool(
  "zora_get_profile_balances",
  {
    title: "Get profile balances",
    description: "List coin balances for a wallet or handle.",
    inputSchema: {
      identifier: z.string(),
      count: z.number().int().min(1).max(100).optional(),
      after: z.string().optional(),
    },
  },
  async ({ identifier, after, count }) => {
    // @ts-expect-error - TypeScript can't resolve barrel exports properly
    const resp = await CoinsSDK.getProfileBalances({ identifier, after, count });
    return { content: [{ type: "text", text: json(resp) }] };
  }
);

// Explore queries
function exploreTool(
  name: string,
  fn: (args: { after?: string; count?: number }) => Promise<unknown>,
  title: string,
  description: string
) {
  server.registerTool(
    name,
    {
      title,
      description,
      inputSchema: {
        count: z.number().int().min(1).max(100).optional(),
        after: z.string().optional(),
      },
    },
    async ({ after, count }) => {
      const resp = await fn({ after, count });
      return { content: [{ type: "text", text: json(resp) }] };
    }
  );
}

exploreTool(
  "zora_explore_top_gainers",
  // @ts-expect-error - TypeScript can't resolve barrel exports properly
  CoinsSDK.getCoinsTopGainers,
  "Top gainers (24h)",
  "Coins with highest market cap delta over last 24h."
);
exploreTool(
  "zora_explore_top_volume_24h",
  // @ts-expect-error - TypeScript can't resolve barrel exports properly
  CoinsSDK.getCoinsTopVolume24h,
  "Top 24h volume",
  "Coins with highest trading volume in last 24 hours."
);
exploreTool(
  "zora_explore_most_valuable",
  // @ts-expect-error - TypeScript can't resolve barrel exports properly
  CoinsSDK.getCoinsMostValuable,
  "Most valuable",
  "Coins with highest market capitalization."
);
exploreTool(
  "zora_explore_new",
  // @ts-expect-error - TypeScript can't resolve barrel exports properly
  CoinsSDK.getCoinsNew,
  "New coins",
  "Most recently created coins."
);
exploreTool(
  "zora_explore_last_traded",
  // @ts-expect-error - TypeScript can't resolve barrel exports properly
  CoinsSDK.getCoinsLastTraded,
  "Last traded",
  "Coins most recently traded."
);
exploreTool(
  "zora_explore_last_traded_unique",
  // @ts-expect-error - TypeScript can't resolve barrel exports properly
  CoinsSDK.getCoinsLastTradedUnique,
  "Last traded (unique traders)",
  "Coins most recently traded by unique traders."
);

// ---- Write tools ----
server.registerTool(
  "zora_create_coin",
  {
    title: "Create a new coin",
    description:
      "Deploy a new Zora coin. Requires PRIVATE_KEY; only Base mainnet is supported currently.",
    inputSchema: {
      name: z.string().min(1),
      symbol: z.string().min(1),
      uri: z.string().min(1),
      payoutRecipient: z.string().min(1),
      platformReferrer: z.string().optional(),
      chainId: z.number().optional(),
      currency: z.enum(["ZORA", "ETH"]).optional(),
      gasMultiplier: z.number().int().min(50).max(500).optional(),
    },
  },
  async (args) => {
    ensureWallet();
    const {
      name,
      symbol,
      uri,
      payoutRecipient,
      platformReferrer,
      chainId,
      currency,
      gasMultiplier,
    } = args;

    const deployCurrency =
      currency === "ETH" ? CoinsSDK.DeployCurrency.ETH : CoinsSDK.DeployCurrency.ZORA;

    const result = await CoinsSDK.createCoin(
      {
        name,
        symbol,
        uri: uri as any, // ValidMetadataURI, validated on chain by SDK
        payoutRecipient: payoutRecipient as any,
        platformReferrer: platformReferrer as any,
        chainId: chainId ?? DEFAULT_CHAIN.id,
        currency: deployCurrency,
      },
      walletClient!,
      publicClient,
      {
        gasMultiplier: gasMultiplier ?? 120,
      }
    );

    return { content: [{ type: "text", text: json(result) }] };
  }
);

server.registerTool(
  "zora_update_coin_uri",
  {
    title: "Update coin metadata URI",
    description:
      "Update the token metadata URI for an existing coin. Requires owner wallet.",
    inputSchema: {
      coin: z.string().min(1),
      newURI: z.string().min(1),
    },
  },
  async ({ coin, newURI }) => {
    ensureWallet();
    const result = await CoinsSDK.updateCoinURI(
      { coin: coin as any, newURI },
      walletClient!,
      publicClient
    );
    return { content: [{ type: "text", text: json(result) }] };
  }
);

server.registerTool(
  "zora_update_payout_recipient",
  {
    title: "Update payout recipient",
    description:
      "Change the payout recipient address (creator earnings). Requires owner wallet.",
    inputSchema: {
      coin: z.string().min(1),
      newPayoutRecipient: z.string().min(1),
    },
  },
  async ({ coin, newPayoutRecipient }) => {
    ensureWallet();
    const result = await CoinsSDK.updatePayoutRecipient(
      { coin: coin as any, newPayoutRecipient: newPayoutRecipient as any },
      walletClient!,
      publicClient
    );
    return { content: [{ type: "text", text: json(result) }] };
  }
);

server.registerTool(
  "zora_trade_coin",
  {
    title: "Trade coin",
    description:
      "Swap ETH or ERC20 for a coin (or back). Uses permit2 for ERC20 where supported. Requires PRIVATE_KEY (EOA).",
    inputSchema: {
      sellType: z.enum(["eth", "erc20"]),
      sellAddress: z.string().optional(),     // required if sellType = erc20
      sellDecimals: z.number().int().min(0).max(36).optional(), // required if sellType = erc20
      buyType: z.enum(["eth", "erc20"]),
      buyAddress: z.string().optional(),      // required if buyType = erc20
      amount: z.string().min(1),              // human-readable, e.g., "0.001" ETH or "4" USDC
      slippage: z.number().min(0).max(0.99).default(0.05).optional(),
      recipient: z.string().optional(),
      sender: z.string().optional(),
    },
  },
  async (args) => {
    ensureWallet();
    const {
      sellType,
      sellAddress,
      sellDecimals,
      buyType,
      buyAddress,
      amount,
      slippage,
      recipient,
      sender,
    } = args;

    const amountIn =
      sellType === "eth"
        ? parseEther(amount)
        : parseUnits(
            amount,
            typeof sellDecimals === "number" ? sellDecimals : 18
          );

    const tradeParameters: any = {
      sell: sellType === "eth" ? { type: "eth" } : { type: "erc20", address: sellAddress },
      buy: buyType === "eth" ? { type: "eth" } : { type: "erc20", address: buyAddress },
      amountIn,
      slippage: typeof slippage === "number" ? slippage : 0.05,
      sender: sender || account!.address,
      recipient: recipient || account!.address,
    };

    const receipt = await CoinsSDK.tradeCoin({
      tradeParameters,
      walletClient: walletClient!,
      account: account!,
      publicClient,
    });

    return { content: [{ type: "text", text: json(receipt) }] };
  }
);

// ---- Connect transport ----
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Avoid noisy console logs: MCP hosts expect pure JSON over stdio.
}

main().catch((err) => {
  console.error("Fatal MCP server error:", err);
  process.exit(1);
});
