# ⚡ Quick Start Guide

Get up and running with Zora Coins MCP Server in under 5 minutes!

## 🎯 For End Users (MCP Clients)

### Claude Desktop Users

1. **Open your MCP configuration file:**
   - **macOS**: `~/.claude/mcp.json`
   - **Windows**: `%APPDATA%\Claude\mcp.json`
   - **Linux**: `~/.config/claude/mcp.json`

2. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "zora-coins": {
         "command": "npx",
         "args": ["zora-coins-mcp-server"],
         "env": {
           "ZORA_API_KEY": "optional_but_recommended"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

4. **Test it:** Ask Claude "What are the newest coins on Zora?"

### Cursor IDE Users

1. **Open Cursor Settings → MCP**

2. **Add new server:**
   ```json
   {
     "name": "zora-coins",
     "command": ["npx", "zora-coins-mcp-server"],
     "env": {
       "ZORA_API_KEY": "optional_but_recommended"
     }
   }
   ```

3. **Restart Cursor**

4. **Test it:** Ask Cursor to explore Zora coins

## 🔑 Getting an API Key (Optional but Recommended)

1. Visit [zora.co](https://zora.co)
2. Sign in or create account
3. Go to Developer Settings
4. Create new API key
5. Add to your MCP configuration

**Benefits:**
- Higher rate limits
- Better performance
- Access to premium features

## 🧪 Quick Test Commands

Try these in your MCP client:

### Basic Exploration
```
Show me the 5 newest coins on Zora
What are the top gaining coins today?
Find the most valuable creator coins
```

### Detailed Analysis
```
Get information about the Base coin at address 0xd769d56f479e9e72a77bb1523e866a33098feec5
Show me the top holders of the horse coin
What's the recent trading activity for Base coin?
```

### Profile Research
```
Tell me about the creator "jacob" and their coins
Show Base's profile and what coins they've created
What coins does jacob hold in their portfolio?
```

## 🛠️ For Developers

### Test the Server Directly

```bash
# Run without installation
npx zora-coins-mcp-server

# Server starts and waits for JSON-RPC messages
```

### Integration Example

```javascript
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: "zora-client",
  version: "1.0.0"
}, { capabilities: {} });

const transport = new StdioClientTransport({
  command: "npx",
  args: ["zora-coins-mcp-server"],
  env: { ZORA_API_KEY: "your_key" }
});

await client.connect(transport);

// Use the tools
const health = await client.callTool("zora.health", {});
const newCoins = await client.callTool("zora.explore_new", { count: 5 });
```

## 🔧 Troubleshooting

### "Command not found"
- Make sure you have Node.js 18+ installed
- Try `npm install -g zora-coins-mcp-server` first

### "Server not responding"
- Check your internet connection
- Verify MCP client configuration
- Try restarting your MCP client

### "API errors"
- Add a Zora API key to your configuration
- Check if you're hitting rate limits

### "Permission errors"
- On Windows: Run as administrator
- On macOS/Linux: Check file permissions

## 📚 What's Next?

1. **Read the full README** for comprehensive documentation
2. **Check EXAMPLES.md** for advanced use cases  
3. **Join the community** on Discord
4. **Report issues** on GitHub

## 🎁 Pro Tips

- **Start simple**: Use without API key first to test
- **Add API key**: Much better performance with Zora API key
- **Explore gradually**: Try different exploration tools
- **Read responses**: The data is very rich and detailed
- **Be patient**: Some queries take a moment to process

---

**Having issues?** Check the [full documentation](README.md) or [open an issue](https://github.com/r4topunk/zora-coins-mcp-server/issues)!
