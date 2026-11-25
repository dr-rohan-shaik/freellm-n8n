# Contributing to FreeLLM n8n

Thank you for your interest in contributing! This guide will help you get started.

## Quick Start

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Make your changes
5. Test thoroughly
6. Submit a PR

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for testing)
- FreeLLM API key (for integration tests)

### Local Development

```bash
# Clone and install
git clone https://github.com/your-username/freellm-n8n.git
cd freellm-n8n
pnpm install

# Build in watch mode
pnpm dev

# Run tests
pnpm test
```

### Using with Local n8n

1. Build the package: `pnpm build`
2. Link to your n8n custom nodes folder:
   ```bash
   # In your n8n project
   npm link /path/to/freellm-n8n/packages/nodes-freellm
   ```
3. Restart n8n

## Code Style

### TypeScript

- Use strict mode
- Prefer interfaces over types
- Use meaningful variable names
- Add JSDoc for public APIs

### Node Structure

Each node should:
1. Implement `INodeType` from `n8n-workflow`
2. Have a clear `description` with all properties
3. Include proper credentials configuration
4. Handle errors gracefully
5. Support both Chat Completions and Responses API formats

### Credentials

- Extend `ICredentialType`
- Include `authenticate` method
- Add test configuration
- Document all properties

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test:watch
```

### Integration Tests

Integration tests require a FreeLLM API key:

```bash
export FREELLM_API_KEY=your-key
pnpm test:integration
```

### Test Structure

```
nodes/FreeLlmChatModel/
├── FreeLlmChatModel.node.ts
├── FreeLlmChatModel.node.test.ts
└── test/
    └── fixtures/
```

## Pull Request Process

1. **Branch**: Create a feature branch from `main`
2. **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)
3. **Tests**: All tests must pass
4. **Documentation**: Update README and docs for new features
5. **Review**: Request review from maintainers

### Commit Messages

```
feat: add new FreeLLM model support
fix: handle rate limiting in chat model
docs: update API key setup instructions
refactor: simplify credential authentication
test: add unit tests for embeddings node
```

## Adding New Models

To add a new FreeLLM model:

1. Update `models.ts` with the new model
2. Add to the fallback list in `searchModels`
3. Test with the actual API
4. Update documentation

## Reporting Issues

Use GitHub Issues with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- n8n version
- FreeLLM node version
- Error logs (if applicable)

## Feature Requests

Open a GitHub Discussion or Issue with:
- Use case description
- Proposed solution
- Alternative approaches considered
- Impact assessment

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn
- Follow n8n community guidelines

## License

By contributing, you agree that your contributions will be licensed under the MIT License.