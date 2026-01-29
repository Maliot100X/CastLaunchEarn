# 🤝 Contributing to Zora Coins MCP Server

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.17
- npm or pnpm
- Git

### Development Setup

1. **Fork and clone the repository:**
```bash
git clone https://github.com/r4topunk/zora-coins-mcp-server.git
cd zora-coins-mcp-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build and test:**
```bash
npm run build
npm run dev
```

## 🛠️ Development Workflow

### Project Structure

```
src/
├── index.ts          # Main server implementation
├── types/            # TypeScript type definitions (if added)
├── utils/            # Utility functions (if added)
└── tools/            # Individual MCP tools (if refactored)
```

### Making Changes

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes:**
   - Follow TypeScript best practices
   - Use proper error handling
   - Add JSDoc comments for public functions
   - Maintain consistency with existing code style

3. **Test your changes:**
```bash
npm run build
npm run dev
```

4. **Test with MCP client:**
   - Update your MCP configuration to use local build
   - Test all affected functionality
   - Verify no regressions

### Code Style Guidelines

- **TypeScript**: Use strict mode, proper typing
- **Error Handling**: Comprehensive try/catch blocks
- **Comments**: JSDoc for functions, inline for complex logic
- **Naming**: Descriptive variable and function names
- **Formatting**: Consistent with existing codebase

### Testing Changes

Since this is an MCP server, testing requires:

1. **Build the project:**
```bash
npm run build
```

2. **Test locally:**
```bash
# Test server startup
node dist/index.js

# Or use development mode
npm run dev
```

3. **Test with MCP client:**
   Update your MCP configuration to point to local build:
   ```json
   {
     "mcpServers": {
       "zora-coins-local": {
         "command": "node",
         "args": ["/path/to/your/zora-coins-mcp-server/dist/index.js"],
         "env": {
           "ZORA_API_KEY": "your_key_here"
         }
       }
     }
   }
   ```

## 📝 Pull Request Process

### Before Submitting

- [ ] Code builds without errors
- [ ] All existing functionality still works
- [ ] New features are documented
- [ ] Changes are tested with MCP client
- [ ] README updated if needed

### PR Guidelines

1. **Clear description**: Explain what changes and why
2. **Link issues**: Reference related GitHub issues
3. **Screenshots/examples**: For UI or behavior changes
4. **Breaking changes**: Clearly document any breaking changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested with Claude Desktop
- [ ] Tested with Cursor
- [ ] Tested read operations
- [ ] Tested write operations (if applicable)

## Checklist
- [ ] Code builds successfully
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## 🐛 Reporting Issues

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Configure MCP with...
2. Call tool...
3. See error

**Expected behavior**
What should happen

**Environment:**
- OS: [e.g. macOS 14.0]
- Node version: [e.g. 18.17.0]
- MCP Client: [e.g. Claude Desktop 1.0]
- Package version: [e.g. 0.1.0]

**Additional context**
Logs, screenshots, etc.
```

### Feature Requests

Use the feature request template:

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Additional Context**
Examples, mockups, etc.
```

## 🔧 Development Tips

### Debugging

1. **Enable debug logging:**
```bash
DEBUG=zora-coins-mcp npm run dev
```

2. **Test individual tools:**
```javascript
// In your MCP client
await mcp.callTool("zora.health", {});
```

3. **Check logs:**
   - MCP client logs
   - Server console output
   - Network requests in browser dev tools

### Common Issues

**"Command not found" errors:**
- Check package.json bin configuration
- Ensure dist/index.js has shebang
- Verify file permissions

**API errors:**
- Check API key configuration
- Verify network connectivity
- Check rate limits

**Type errors:**
- Run `npm run build` to see TypeScript errors
- Check Zod schema validation
- Verify input parameter types

## 📚 Resources

### Documentation
- [Zora Coins SDK](https://docs.zora.co/coins/sdk)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- [Zod](https://zod.dev/) - Schema validation
- [Viem](https://viem.sh/) - Ethereum interactions
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## 🎯 Areas for Contribution

### High Priority
- [ ] Add comprehensive error handling
- [ ] Implement caching for API responses
- [ ] Add retry logic for failed requests
- [ ] Create automated tests

### Medium Priority
- [ ] Add more exploration tools
- [ ] Implement batch operations
- [ ] Add configuration validation
- [ ] Improve documentation

### Low Priority
- [ ] Add support for other networks
- [ ] Create CLI interface
- [ ] Add metrics/monitoring
- [ ] Performance optimizations

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in package.json

Thank you for helping make this project better! 🙏

---

**Questions?** Open an issue or join our [Discord](https://discord.gg/zora) community.
