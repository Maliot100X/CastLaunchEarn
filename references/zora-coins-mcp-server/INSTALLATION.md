# 📦 Installation Guide

This guide will walk you through installing and configuring the Zora Coins MCP Server for different use cases.

## 🎯 Choose Your Installation Method

### Option 1: Global NPM Installation (Recommended)

Perfect for most users who want to use the server with MCP clients like Claude Desktop.

```bash
npm install -g zora-coins-mcp-server
```

### Option 2: Local Project Installation

For developers who want to integrate the server into their projects.

```bash
npm install zora-coins-mcp-server
```

### Option 3: From Source

For contributors and advanced users who want the latest features.

```bash
git clone https://github.com/r4topunk/zora-coins-mcp-server.git
cd zora-coins-mcp-server
npm install
npm run build
```

## ⚙️ Configuration Setup

### 1. Environment Configuration

Create your environment file:

```bash
# Copy the example file
cp .env.example .env

# Edit with your preferred editor
nano .env  # or vim, code, etc.
```

### 2. Required Configuration

#### Zora API Key (Highly Recommended)

1. Visit [zora.co](https://zora.co)
2. Sign in or create an account
3. Navigate to Developer Settings
4. Click "Create API Key"
5. Copy the key to your `.env` file:

```bash
ZORA_API_KEY=your_api_key_here
```

**Benefits of API Key:**
- Higher rate limits
- Access to premium features
- Better error messages
- Priority support

#### Base RPC URL (Optional)

For better performance, use a dedicated RPC endpoint:

```bash
# Alchemy (recommended)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Infura
BASE_RPC_URL=https://base-mainnet.infura.io/v3/YOUR_PROJECT_ID

# QuickNode
BASE_RPC_URL=https://your-endpoint.base-mainnet.quiknode.pro/YOUR_TOKEN

# Public RPC (default, may be slower)
BASE_RPC_URL=https://mainnet.base.org
```

#### Private Key (For Write Operations Only)

⚠️ **Security Warning**: Only add this if you need write operations (trading, creating coins).

```bash
PRIVATE_KEY=0xYourPrivateKeyHere
```

**Security Best Practices:**
- Use a dedicated wallet for this purpose
- Never commit the `.env` file to version control
- Start with small amounts for testing
- Consider using a hardware wallet for production

### 3. Complete Configuration Example

```bash
# --- Zora Coins MCP server configuration ---

# Get an API key at https://zora.co (Developer Settings)
ZORA_API_KEY=zora_sk_1234567890abcdef

# Base mainnet RPC endpoint (Alchemy/Infura/custom)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Chain to use (Base mainnet)
CHAIN_ID=8453

# Private key for onchain writes (0x-prefixed). Leave empty for read-only.
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Optional: platform referrer address
PLATFORM_REFERRER=0xYourReferrerAddress
```

## 🔌 MCP Client Integration

### Claude Desktop Setup

1. **Locate your configuration file:**

   - **macOS**: `~/.claude/mcp.json`
   - **Windows**: `%APPDATA%\Claude\mcp.json`
   - **Linux**: `~/.config/claude/mcp.json`

2. **Create/edit the configuration:**

```json
{
  "mcpServers": {
    "zora-coins": {
      "command": "zora-coins-mcp",
      "env": {
        "ZORA_API_KEY": "your_api_key_here",
        "BASE_RPC_URL": "https://mainnet.base.org"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Verify connection:**
   - Open a new chat
   - Ask: "Can you check the Zora server health?"
   - You should see server status information

### Cursor IDE Setup

1. **Open Cursor Settings**
2. **Navigate to MCP Configuration**
3. **Add new server:**

```json
{
  "name": "zora-coins",
  "command": ["zora-coins-mcp"],
  "env": {
    "ZORA_API_KEY": "your_api_key_here",
    "BASE_RPC_URL": "https://mainnet.base.org"
  }
}
```

### Custom MCP Client

For custom integrations:

```javascript
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client(
  {
    name: "zora-coins-client",
    version: "1.0.0"
  },
  {
    capabilities: {}
  }
);

const transport = new StdioClientTransport({
  command: "zora-coins-mcp",
  args: [],
  env: {
    ZORA_API_KEY: "your_api_key_here"
  }
});

await client.connect(transport);
```

## 🧪 Testing Your Installation

### 1. Basic Server Test

```bash
# Test server startup
zora-coins-mcp

# You should see JSON-RPC messages if working correctly
```

### 2. Health Check

In your MCP client, try:

```
Can you check the Zora server health?
```

Expected response should include:
- Server name and version
- API key status
- RPC URL
- Chain ID
- Wallet address (if configured)

### 3. Query Test

Try a simple query:

```
Show me the 3 newest coins on Zora
```

### 4. Advanced Test

For a comprehensive test:

```
Get information about the "Base is for everyone" coin and show me its top 5 holders
```

## 🔧 Troubleshooting

### Common Issues

#### "Command not found: zora-coins-mcp"

**Solution:**
```bash
# Check if globally installed
npm list -g zora-coins-mcp-server

# If not installed, install globally
npm install -g zora-coins-mcp-server

# Check your PATH includes npm global bin
npm config get prefix
```

#### "Server not responding"

**Solutions:**
1. Check if the server process is running
2. Verify your environment variables
3. Try restarting your MCP client
4. Check for port conflicts

#### "API rate limited"

**Solutions:**
1. Add a Zora API key to your `.env`
2. Use a dedicated RPC endpoint
3. Reduce query frequency

#### "Transaction failed"

**Solutions:**
1. Verify your private key is correct
2. Ensure sufficient ETH balance for gas
3. Check network congestion
4. Try with a higher gas limit

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
DEBUG=zora-coins-mcp zora-coins-mcp

# Or in your .env file
DEBUG=zora-coins-mcp
```

### Getting Help

1. **Check the logs** for error messages
2. **Verify configuration** with the health check
3. **Test with minimal setup** (no API key, no private key)
4. **Join our community** for support:
   - [GitHub Issues](https://github.com/r4topunk/zora-coins-mcp-server/issues)
   - [Zora Discord](https://discord.gg/zora)

## 🚀 Next Steps

After successful installation:

1. **Explore the features** - Try different query tools
2. **Read the examples** - Check out common use cases
3. **Join the community** - Connect with other users
4. **Contribute** - Help improve the project

## 🔒 Security Checklist

Before going to production:

- [ ] API keys are stored securely
- [ ] Private keys are in environment variables only
- [ ] `.env` file is in `.gitignore`
- [ ] Using dedicated wallets for transactions
- [ ] Tested with small amounts first
- [ ] RPC endpoints are reliable and secure

---

**Need more help?** Check our [FAQ](FAQ.md) or [open an issue](https://github.com/r4topunk/zora-coins-mcp-server/issues/new).
