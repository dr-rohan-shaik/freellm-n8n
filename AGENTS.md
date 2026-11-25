# FreeLLM n8n - Agent Instructions

## Project Overview

This is a custom n8n node package that provides FreeLLM integration for n8n workflows. It includes:

- **FreeLlmChatModel** - Chat with any FreeLLM model
- **FreeLlmAgent** - Build AI agents with FreeLLM models
- **FreeLlmEmbeddings** - Generate embeddings for RAG
- **FreeLlmApi** - Pre-configured credential for FreeLLM API

## Architecture

```
packages/nodes-freellm/
├── credentials/
│   └── FreeLlmApi.credentials.ts    # FreeLLM API credential
├── nodes/
│   ├── FreeLlmChatModel/            # Chat model node
│   ├── FreeLlmAgent/                # Agent node
│   ├── FreeLlmEmbeddings/           # Embeddings node
│   └── shared/                      # Shared utilities
├── utils/
│   ├── chatModelMessageWrapper.ts   # Message wrapper
│   └── custom-model-endpoint/       # Custom endpoint utilities
│       ├── gateway-config.ts        # Config builder
│       ├── descriptions.ts          # Node property descriptions
│       ├── context-headers.ts       # n8n context headers
│       ├── headers.ts               # Header builders
│       ├── models.ts                # Model search
│       └── oauth2.ts                # OAuth2 support
└── icons/
    ├── freellm.svg
    └── freellm.dark.svg
```

## Key Design Decisions

1. **FreeLLM-First**: All nodes use FreeLLM credential by default, no need to configure custom endpoints manually
2. **OpenAI-Compatible**: Uses LangChain's ChatOpenAI under the hood for compatibility
3. **Type-Safe**: Full TypeScript with strict mode
4. **Extensible**: Easy to add new models or features

## Development Commands

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint
```

## Adding New Nodes

1. Create node directory under `nodes/`
2. Implement `INodeType` interface
3. Export from `index.ts`
4. Add to `package.json` n8n section

## Testing

- Unit tests in `__tests__` directories
- Integration tests with real FreeLLM API
- Use `vitest` for testing

## Deployment

- Docker: `docker-compose up -d`
- Manual: Copy `dist/` to n8n custom nodes folder
- npm: `npm publish` (when ready)

## FreeLLM API Integration

The nodes use FreeLLM's OpenAI-compatible API:
- Base URL: `https://api.freellm.com/v1`
- Authentication: Bearer token
- Models: 50+ including GPT-4o, Claude 3.5, Llama 3.1, etc.

## Credentials

The `FreeLlmApi` credential provides:
- API Key (required)
- Base URL (configurable)
- Default Model
- Organization ID
- Custom Headers

## Agent Guidelines

When working on this codebase:
1. Follow existing patterns in n8n nodes
2. Use LangChain abstractions where possible
3. Keep nodes focused and single-purpose
4. Add proper error handling and retries
5. Include TypeScript types for all configs
6. Test with real FreeLLM API before committing