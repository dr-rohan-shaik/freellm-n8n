# FreeLLM n8n Integration

Use any LLM model (GPT-4o, Claude 3.5, Llama 3.1, Mistral, Gemini, and more) in n8n through the FreeLLM API.

## Features

- **FreeLLM Chat Model** - Chat with any FreeLLM model using a simple, pre-configured node
- **FreeLLM Agent** - Build AI agents with tools using FreeLLM models
- **FreeLLM Embeddings** - Generate embeddings for RAG and semantic search
- **Pre-configured Credentials** - One-click setup with your FreeLLM API key
- **Model Discovery** - Browse and select from all available FreeLLM models

## Quick Start

### 1. Install the nodes

```bash
# In your n8n custom nodes folder
npm install @n8n/nodes-freellm
```

Or if using n8n with Docker, add to your `docker-compose.yml`:

```yaml
services:
  n8n:
    environment:
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
    volumes:
      - ./custom:/home/node/.n8n/custom
```

### 2. Get your FreeLLM API Key

1. Sign up at [freellm.com](https://freellm.com)
2. Go to [API Keys](https://freellm.com/api-keys)
3. Create a new API key

### 3. Configure in n8n

1. Open n8n → Credentials → New Credential
2. Search for "FreeLLM"
3. Enter your API key
4. Save

### 4. Use in workflows

Drag the **FreeLLM Chat Model** node into your workflow and connect it to an Agent or Chain.

## Available Models

FreeLLM provides access to 50+ models:

| Category | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo |
| Anthropic | Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus |
| Meta | Llama 3.1 405B, 70B, 8B |
| Mistral | Mistral Large, Mistral Nemo, Mixtral 8x7B |
| Google | Gemini 1.5 Pro, Gemini 1.5 Flash |
| Cohere | Command R+, Command R |
| And more... | |

## Nodes

### FreeLLM Chat Model
Use any FreeLLM model as a language model in chains and agents.

**Features:**
- Chat Completions & Responses API formats
- Temperature, top-p, max tokens control
- Custom headers for routing/tracking
- Context headers for debugging
- Extra body for provider-specific params

### FreeLLM Agent
Build autonomous agents with tool access.

**Features:**
- OpenAI Tools agent architecture
- Configurable max iterations
- Intermediate steps tracking
- Custom system prompts
- All Chat Model options

### FreeLLM Embeddings
Generate embeddings for vector databases and RAG.

**Models:**
- text-embedding-3-large (3072 dims)
- text-embedding-3-small (1536 dims)
- text-embedding-ada-002 (1536 dims)

## Configuration

### Environment Variables

```bash
# Optional: Override default FreeLLM endpoint
FREELLM_API_URL=https://api.freellm.com/v1

# Optional: Default model
FREELLM_DEFAULT_MODEL=freellm-gpt-4o
```

### Credential Options

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| Base URL | Yes | `https://api.freellm.com/v1` | FreeLLM API endpoint |
| API Key | Yes | - | Your FreeLLM API key |
| Default Model | No | `freellm-gpt-4o` | Fallback model |
| Organization ID | No | - | For multi-org accounts |
| Custom Headers | No | - | Additional request headers |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test
```

## Example Workflows

### Simple Chat
```
FreeLLM Chat Model → Agent → Output
```

### RAG Pipeline
```
Document Loader → Text Splitter → FreeLLM Embeddings → Vector Store
                                                    ↓
Question → FreeLLM Chat Model → Agent → Answer
```

### Multi-Model Router
```
Input → Switch (by task type)
  ├─ Code → FreeLLM Chat Model (freellm-gpt-4o)
  ├─ Creative → FreeLLM Chat Model (freellm-claude-3.5-sonnet)
  ├─ Fast → FreeLLM Chat Model (freellm-gpt-4o-mini)
  └─ Local → FreeLLM Chat Model (freellm-llama-3.1-8b)
```

## Troubleshooting

### "Model not found" error
- Check your API key is valid
- Ensure the model name matches exactly (case-sensitive)
- Some models may require specific subscription tier

### Connection timeout
- Increase timeout in node options (default 60s)
- Check network connectivity to api.freellm.com
- Verify firewall/proxy settings

### Rate limiting
- FreeLLM has generous rate limits
- Implement exponential backoff in workflows
- Use maxRetries option in nodes

## License

MIT - See LICENSE for details

## Support

- Documentation: https://docs.freellm.com/integrations/n8n
- Issues: https://github.com/freellm/n8n-nodes/issues
- Discord: https://discord.gg/freellm