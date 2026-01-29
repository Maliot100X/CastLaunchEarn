# 💡 Usage Examples

This guide provides practical examples of using the Zora Coins MCP Server for common tasks.

## 🔍 Market Research & Analysis

### Discover Trending Coins

```javascript
// Find the hottest new coins
await mcp.callTool("zora_explore_new", { count: 10 });

// Check biggest gainers in the last 24h
await mcp.callTool("zora_explore_top_gainers", { count: 5 });

// See coins with highest trading volume
await mcp.callTool("zora_explore_top_volume_24h", { count: 5 });
```

**Natural Language (Claude/Cursor):**
```
Show me the 10 newest coins on Zora and their current prices
What are the top 5 gaining coins today?
Which coins have the highest trading volume in the last 24 hours?
```

### Deep Dive Analysis

```javascript
// Get comprehensive coin data
const coinData = await mcp.callTool("zora_get_coin", {
  address: "0xd769d56f479e9e72a77bb1523e866a33098feec5"
});

// Check who's holding the coin
const holders = await mcp.callTool("zora_get_coin_holders", {
  address: "0xd769d56f479e9e72a77bb1523e866a33098feec5",
  count: 20
});

// See recent trading activity
const trades = await mcp.callTool("zora_get_coin_swaps", {
  address: "0xd769d56f479e9e72a77bb1523e866a33098feec5",
  first: 15
});
```

**Natural Language:**
```
Analyze the "Base is for everyone" coin at address 0xd769d56f479e9e72a77bb1523e866a33098feec5. 
Show me its market data, top holders, and recent trades.
```

## 👤 Creator & Profile Research

### Profile Analysis

```javascript
// Get creator profile information
const profile = await mcp.callTool("zora_get_profile", {
  identifier: "jacob"  // Can use handle or wallet address
});

// See what coins they've created
const createdCoins = await mcp.callTool("zora_get_profile_coins", {
  identifier: "jacob",
  count: 10
});

// Check their coin portfolio
const portfolio = await mcp.callTool("zora_get_profile_balances", {
  identifier: "jacob",
  count: 20
});
```

**Natural Language:**
```
Tell me about the creator "jacob" - what coins have they created and what's in their portfolio?
Show me Base's profile and all the coins they've launched
```

### Creator Success Metrics

```javascript
// Multi-step analysis combining several calls
const profileData = await mcp.callTool("zora_get_profile", {
  identifier: "base"
});

const createdCoins = await mcp.callTool("zora_get_profile_coins", {
  identifier: "base",
  count: 5
});

// For each coin, get detailed metrics
for (const coin of createdCoins.data.profile.createdCoins.edges) {
  const coinDetails = await mcp.callTool("zora_get_coin", {
    address: coin.node.address
  });
  
  const holders = await mcp.callTool("zora_get_coin_holders", {
    address: coin.node.address,
    count: 5
  });
}
```

**Natural Language:**
```
Create a comprehensive report on Base as a creator: their profile, top coins they've created, 
market performance, and holder distribution for each coin.
```

## 💰 Trading & Transactions

### Market Making Strategy

```javascript
// Buy a coin with ETH
const buyTrade = await mcp.callTool("zora_trade_coin", {
  sellType: "eth",
  buyType: "erc20",
  buyAddress: "0xf1fc9580784335b2613c1392a530c1aa2a69ba3d", // horse coin
  amount: "0.01",  // 0.01 ETH
  slippage: 0.05   // 5% slippage tolerance
});

// Later, sell some back
const sellTrade = await mcp.callTool("zora_trade_coin", {
  sellType: "erc20",
  sellAddress: "0xf1fc9580784335b2613c1392a530c1aa2a69ba3d",
  sellDecimals: 18,
  buyType: "eth",
  amount: "1000",  // 1000 tokens
  slippage: 0.05
});
```

### Portfolio Rebalancing

```javascript
// Check current portfolio
const portfolio = await mcp.callTool("zora_get_profile_balances", {
  identifier: "0xYourWalletAddress",
  count: 50
});

// Analyze each holding
for (const holding of portfolio.data.profile.coinBalances.edges) {
  const coinData = await mcp.callTool("zora_get_coin", {
    address: holding.node.coin.address
  });
  
  // Calculate position value
  const balance = BigInt(holding.node.balance);
  const price = parseFloat(coinData.data.zora20Token.tokenPrice.priceInUsdc);
  const value = Number(balance) * price / 1e18; // Assuming 18 decimals
  
  console.log(`${coinData.data.zora20Token.name}: ${value.toFixed(2)} USD`);
}
```

## 🎨 Creator Coin Launch

### Complete Launch Workflow

```javascript
// 1. Create the coin
const newCoin = await mcp.callTool("zora_create_coin", {
  name: "My Creative Journey",
  symbol: "JOURNEY",
  uri: "ipfs://bafybeiabc123...", // Your metadata URI
  payoutRecipient: "0xYourWalletAddress",
  currency: "ETH", // or "ZORA"
  platformReferrer: "0xReferrerAddress" // Optional
});

// 2. Make initial purchase to establish liquidity
const initialBuy = await mcp.callTool("zora_trade_coin", {
  sellType: "eth",
  buyType: "erc20",
  buyAddress: newCoin.contractAddress,
  amount: "0.1", // 0.1 ETH initial liquidity
  slippage: 0.1  // Higher slippage for new coins
});

// 3. Monitor the launch
const coinStatus = await mcp.callTool("zora_get_coin", {
  address: newCoin.contractAddress
});
```

### Update Coin Metadata

```javascript
// Update the metadata URI (creator only)
const updateResult = await mcp.callTool("zora_update_coin_uri", {
  coin: "0xYourCoinAddress",
  newURI: "ipfs://bafybeiabc456..." // Updated metadata
});

// Change payout recipient (creator only)
const payoutUpdate = await mcp.callTool("zora_update_payout_recipient", {
  coin: "0xYourCoinAddress",
  newPayoutRecipient: "0xNewRecipientAddress"
});
```

## 📊 Community Engagement

### Social Analysis

```javascript
// Get community comments
const comments = await mcp.callTool("zora_get_coin_comments", {
  address: "0xd769d56f479e9e72a77bb1523e866a33098feec5",
  count: 50
});

// Analyze comment sentiment and engagement
const commentAnalysis = comments.data.zora20Token.zoraComments.edges.map(edge => ({
  user: edge.node.userProfile.handle,
  comment: edge.node.comment,
  timestamp: new Date(edge.node.timestamp * 1000),
  txHash: edge.node.txHash
}));

// Sort by most recent
commentAnalysis.sort((a, b) => b.timestamp - a.timestamp);
```

**Natural Language:**
```
Show me the latest community comments on the Base coin and analyze the sentiment
What are people saying about the horse coin recently?
```

## 🤖 Automated Strategies

### Dollar Cost Averaging Bot

```javascript
class DCABot {
  constructor(targetCoin, weeklyAmount, maxSlippage = 0.05) {
    this.targetCoin = targetCoin;
    this.weeklyAmount = weeklyAmount;
    this.maxSlippage = maxSlippage;
  }
  
  async executeDCA() {
    try {
      // Get current price for logging
      const coinData = await mcp.callTool("zora_get_coin", {
        address: this.targetCoin
      });
      
      console.log(`DCA: Buying ${this.weeklyAmount} ETH worth of ${coinData.data.zora20Token.name}`);
      
      // Execute purchase
      const trade = await mcp.callTool("zora_trade_coin", {
        sellType: "eth",
        buyType: "erc20",
        buyAddress: this.targetCoin,
        amount: this.weeklyAmount,
        slippage: this.maxSlippage
      });
      
      console.log(`DCA: Trade successful - ${trade.transactionHash}`);
      return trade;
      
    } catch (error) {
      console.error(`DCA: Failed to execute trade:`, error);
      throw error;
    }
  }
}

// Usage
const dcaBot = new DCABot(
  "0xf1fc9580784335b2613c1392a530c1aa2a69ba3d", // horse coin
  "0.01" // 0.01 ETH weekly
);

// Run weekly (you'd set this up with a cron job or scheduler)
// await dcaBot.executeDCA();
```

### Trend Following Strategy

```javascript
class TrendFollower {
  async findTrendingCoins() {
    // Get top gainers
    const gainers = await mcp.callTool("zora_explore_top_gainers", { count: 10 });
    
    // Get high volume coins
    const highVolume = await mcp.callTool("zora_explore_top_volume_24h", { count: 10 });
    
    // Find coins that appear in both lists
    const gainerAddresses = new Set(
      gainers.data.exploreList.edges.map(e => e.node.address)
    );
    
    const trendingCoins = highVolume.data.exploreList.edges.filter(
      edge => gainerAddresses.has(edge.node.address)
    );
    
    return trendingCoins;
  }
  
  async analyzeAndTrade(coins) {
    for (const coinEdge of coins) {
      const coin = coinEdge.node;
      
      // Get detailed data
      const details = await mcp.callTool("zora_get_coin", {
        address: coin.address
      });
      
      // Simple momentum check
      const marketCapDelta = parseFloat(coin.marketCapDelta24h);
      const volume24h = parseFloat(coin.volume24h);
      
      if (marketCapDelta > 10000 && volume24h > 5000) { // Thresholds
        console.log(`Potential buy signal for ${coin.name}`);
        
        // Execute small test trade
        // await this.executeTrade(coin.address, "0.001");
      }
    }
  }
}
```

## 📈 Analytics & Reporting

### Portfolio Performance Report

```javascript
async function generatePortfolioReport(walletAddress) {
  // Get current holdings
  const portfolio = await mcp.callTool("zora_get_profile_balances", {
    identifier: walletAddress,
    count: 100
  });
  
  let totalValue = 0;
  const holdings = [];
  
  for (const holding of portfolio.data.profile.coinBalances.edges) {
    const coinData = await mcp.callTool("zora_get_coin", {
      address: holding.node.coin.address
    });
    
    const balance = BigInt(holding.node.balance);
    const price = parseFloat(coinData.data.zora20Token.tokenPrice.priceInUsdc);
    const value = Number(balance) * price / 1e18;
    
    totalValue += value;
    
    holdings.push({
      name: coinData.data.zora20Token.name,
      symbol: coinData.data.zora20Token.symbol,
      balance: Number(balance) / 1e18,
      price: price,
      value: value,
      marketCap: parseFloat(coinData.data.zora20Token.marketCap),
      change24h: parseFloat(coinData.data.zora20Token.marketCapDelta24h)
    });
  }
  
  // Sort by value
  holdings.sort((a, b) => b.value - a.value);
  
  return {
    totalValue,
    holdings,
    topHolding: holdings[0],
    diversification: holdings.length
  };
}
```

**Natural Language:**
```
Generate a complete portfolio report for my wallet showing current values, 
top holdings, and 24h changes for all my Zora coins
```

## 🚨 Monitoring & Alerts

### Price Alert System

```javascript
class PriceMonitor {
  constructor(targets) {
    this.targets = targets; // Array of {address, name, alertPrice, direction}
    this.lastPrices = new Map();
  }
  
  async checkPrices() {
    for (const target of this.targets) {
      try {
        const coinData = await mcp.callTool("zora_get_coin", {
          address: target.address
        });
        
        const currentPrice = parseFloat(coinData.data.zora20Token.tokenPrice.priceInUsdc);
        const lastPrice = this.lastPrices.get(target.address);
        
        // Check alert conditions
        if (target.direction === 'above' && currentPrice > target.alertPrice) {
          this.sendAlert(`🚀 ${target.name} is now $${currentPrice.toFixed(6)} (above $${target.alertPrice})`);
        } else if (target.direction === 'below' && currentPrice < target.alertPrice) {
          this.sendAlert(`📉 ${target.name} is now $${currentPrice.toFixed(6)} (below $${target.alertPrice})`);
        }
        
        // Check for significant moves
        if (lastPrice && Math.abs(currentPrice - lastPrice) / lastPrice > 0.1) { // 10% move
          const direction = currentPrice > lastPrice ? '🚀' : '📉';
          const change = ((currentPrice - lastPrice) / lastPrice * 100).toFixed(2);
          this.sendAlert(`${direction} ${target.name}: ${change}% change to $${currentPrice.toFixed(6)}`);
        }
        
        this.lastPrices.set(target.address, currentPrice);
        
      } catch (error) {
        console.error(`Error monitoring ${target.name}:`, error);
      }
    }
  }
  
  sendAlert(message) {
    console.log(`ALERT: ${message}`);
    // Integrate with Discord, Slack, email, etc.
  }
}

// Usage
const monitor = new PriceMonitor([
  {
    address: "0xf1fc9580784335b2613c1392a530c1aa2a69ba3d",
    name: "horse",
    alertPrice: 0.005,
    direction: "above"
  },
  {
    address: "0xd769d56f479e9e72a77bb1523e866a33098feec5",
    name: "Base is for everyone",
    alertPrice: 0.004,
    direction: "below"
  }
]);

// Run every minute
// setInterval(() => monitor.checkPrices(), 60000);
```

## 🎯 Advanced Patterns

### Batch Operations

```javascript
// Efficiently check multiple coins
async function batchCoinAnalysis(addresses) {
  const results = await Promise.all(
    addresses.map(address => 
      mcp.callTool("zora_get_coin", { address })
    )
  );
  
  return results.map((result, index) => ({
    address: addresses[index],
    data: result.data.zora20Token
  }));
}

// Usage
const coins = [
  "0xd769d56f479e9e72a77bb1523e866a33098feec5",
  "0xf1fc9580784335b2613c1392a530c1aa2a69ba3d",
  "0x445e9c0a296068dc4257767b5ed354b77cf513de"
];

const analysis = await batchCoinAnalysis(coins);
```

### Error Handling & Retries

```javascript
async function robustTrade(params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await mcp.callTool("zora_trade_coin", params);
      console.log(`Trade successful on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      console.log(`Trade attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      
      // Adjust slippage on retry
      if (params.slippage < 0.15) {
        params.slippage += 0.02;
        console.log(`Increasing slippage to ${params.slippage}`);
      }
    }
  }
}
```

---

**💡 Pro Tips:**

1. **Rate Limiting**: Add delays between API calls to avoid rate limits
2. **Error Handling**: Always wrap calls in try/catch blocks
3. **Gas Optimization**: Monitor Base network congestion for optimal trade timing
4. **Security**: Never hardcode private keys - use environment variables
5. **Testing**: Start with small amounts when testing trading strategies

**Need more examples?** Check the [GitHub Issues](https://github.com/r4topunk/zora-coins-mcp-server/issues) or join our [Discord](https://discord.gg/zora) community!
