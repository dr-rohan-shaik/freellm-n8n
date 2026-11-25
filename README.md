# FreeLLM n8n Integration (Self-Hosted)

Use any LLM model (GPT-4o, Claude 3.5, Llama 3.1, Mistral, Gemini, and more) in n8n through your **self-hosted FreeLLM API** instance.

Based on [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) — a unified OpenAI-compatible gateway for 50+ free LLM providers.

## Features

- **FreeLLM Chat Model** - Chat with any model configured in your FreeLLM instance
- **FreeLLM Agent** - Build AI agents with tools using FreeLLM models
- **FreeLLM Embeddings** - Generate embeddings for RAG and semantic search
- **Pre-configured Credentials** - One-click setup with your FreeLLM unified API key
- **Model Discovery** - Browse and select from all models in your FreeLLM catalog

## Quick Start

### Prerequisites

1. **Self-host FreeLLMAPI** - Follow the [FreeLLMAPI setup guide](https://github.com/tashfeenahmed/freellmapi#readme)
2. **Add provider keys** - In FreeLLM dashboard, add your API keys for Google, Groq, Cerebras, OpenRouter, etc.
3. **Create unified API key** - In FreeLLM dashboard → Settings → Create a unified API key

### 1. Deploy with Docker (Recommended)

```bash
cd freellm-n8n
./scripts/setup.sh        # Linux/macOS
# or
.\scripts\setup.ps1       # Windows PowerShell
```

This starts:
- **n8n** on http://localhost:5678
- **FreeLLMAPI** on http://localhost:3000 (if not already running)
- **Qdrant** on http://localhost:6333 (for RAG)

### 2. Manual Installation

```bash
# In your n8n custom nodes folder
npm install @n8n/nodes-freellm
```

Or with Docker, add to your `docker-compose.yml`:

```yaml
services:
  n8n:
    environment:
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
    volumes:
      - ./custom:/home/node/.n8n/custom
```

### 3. Configure in n8n

1. Open n8n → Credentials → New Credential
2. Search for **"FreeLLM API (Self-Hosted)"**
3. Enter:
   - **Base URL**: Your FreeLLMAPI URL with `/v1` suffix (e.g., `http://localhost:3000/v1` or `https://your-domain.com/v1`)
   - **API Key**: Your FreeLLM unified API key
   - **Default Model**: Fallback model (e.g., `gpt-4o`)
4. Save

### 4. Use in workflows

Drag the **FreeLLM Chat Model** node into your workflow and connect it to an Agent or Chain.

## Available Models

Models depend on what you've configured in your FreeLLMAPI instance. Typical providers include:

| Category | Example Models |
|----------|----------------|
| OpenAI | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo` |
| Anthropic | `claude-3.5-sonnet`, `claude-3.5-haiku`, `claude-3-opus` |
| Meta | `llama-3.1-405b`, `llama-3.1-70b`, `llama-3.1-8b` |
| Mistral | `mistral-large`, `mistral-nemo`, `mixtral-8x7b` |
| Google | `gemini-1.5-pro`, `gemini-1.5-flash` |
| Cohere | `command-r-plus`, `command-r` |
| And 40+ more... | Via OpenRouter, Requesty, etc. |

*Exact model IDs come from your FreeLLM catalog — use the searchable dropdown in the node.*

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
- `text-embedding-3-large` (3072 dims)
- `text-embedding-3-small` (1536 dims)
- `text-embedding-ada-002` (1536 dims)

## Configuration

### Credential Options

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| Base URL | Yes | `http://localhost:3000/v1` | Your FreeLLMAPI URL with `/v1` suffix |
| API Key | Yes | - | Your FreeLLM unified API key |
| Default Model | No | `gpt-4o` | Fallback model |
| Custom Headers | No | - | Additional request headers |

### Environment Variables (Optional)

```bash
# Override default FreeLLMAPI endpoint
FREELLM_API_URL=http://localhost:3000/v1

# Default model
FREELLM_DEFAULT_MODEL=gpt-4o
```

## FreeLLMAPI Setup Reference

### Quick FreeLLMAPI Deploy

```bash
git clone https://github.com/tashfeenahmed/freellmapi.git
cd freellmapi
cp .env.example .env
# Edit .env with your provider keys
docker-compose up -d
```

### Add Provider Keys

1. Open FreeLLMAPI dashboard: http://localhost:3000
2. Go to **Keys** page
3. Add keys for providers you want:
   - **Google AI Studio** (Gemini) - free tier available
   - **Groq** - fast inference, free tier
   - **Cerebras** - fast inference, free tier
   - **OpenRouter** - 100+ models
   - **Requesty** - router with free models
   - **Ollama** - local models
   - And many more...

### Create Unified API Key

1. In FreeLLMAPI dashboard → **Settings**
2. Generate a **Unified API Key**
3. Copy and use in n8n credential

## Example Workflows

### Simple Chat
```
FreeLLM Chat Model → Agent → Output
```

### RAG Pipeline
```
Document Loader → Text Splitter → FreeLLM Embeddings → Vector Store (Qdrant)
                                                    ↓
Question → FreeLLM Chat Model → Agent → Answer
```

### Multi-Model Router
```
Input → Switch (by task type)
  ├─ Code → FreeLLM Chat Model (gpt-4o)
  ├─ Creative → FreeLLM Chat Model (claude-3.5-sonnet)
  ├─ Fast → FreeLLM Chat Model (gpt-4o-mini)
  └─ Local → FreeLLM Chat Model (llama-3.1-8b)
```

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

## Troubleshooting

### "Model not found" error
- Check your FreeLLMAPI catalog has the model (dashboard → Models)
- Ensure the model name matches exactly (case-sensitive)
- Verify your provider keys are valid and have quota

### Connection timeout
- Increase timeout in node options (default 60s)
- Check network connectivity to your FreeLLMAPI instance
- Verify firewall/proxy settings

### Rate limiting
- FreeLLMAPI respects provider rate limits
- Implement exponential backoff in workflows
- Use maxRetries option in nodes
- Check FreeLLMAPI logs: `docker-compose logs freellmapi`

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   n8n       │────▶│  FreeLLMAPI      │────▶│  Providers      │
│  (workflows)│     │  (gateway)       │     │  (Google,       │
└─────────────┘     │  http://localhost:3000/v1  │  Groq, etc.)   │
                    └──────────────────┘     └─────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Unified    │
                    │  API Key    │
                    └─────────────┘
```

## License

MIT - See LICENSE for details

## Links

- **FreeLLMAPI Repo**: https://github.com/tashfeenahmed/freellmapi
- **FreeLLMAPI Docs**: https://github.com/tashfeenahmed/freellmapi#readme
- **n8n Docs**: https://docs.n8n.io
- **Issues**: https://github.com/dr-rohan-shaik/freellm-n8n/issues