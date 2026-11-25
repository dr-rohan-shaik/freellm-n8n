# Changelog

All notable changes to FreeLLM n8n will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-25

### Added

- **FreeLlmChatModel** node - Chat with any FreeLLM model
  - Support for Chat Completions and Responses API formats
  - Model selection with searchable dropdown
  - Temperature, top-p, max tokens configuration
  - Custom headers for routing/tracking
  - Context headers for debugging
  - Extra body for provider-specific parameters
  - Retry logic with exponential backoff

- **FreeLlmAgent** node - Build AI agents with FreeLLM
  - OpenAI Tools agent architecture
  - Configurable max iterations
  - Intermediate steps tracking
  - Custom system prompts
  - Early stopping methods
  - Tool integration support

- **FreeLlmEmbeddings** node - Generate embeddings
  - text-embedding-3-large (3072 dimensions)
  - text-embedding-3-small (1536 dimensions)
  - text-embedding-ada-002 (1536 dimensions)
  - Configurable dimensions for v3 models

- **FreeLlmApi** credential - Pre-configured for FreeLLM
  - API Key authentication
  - Configurable base URL
  - Default model selection
  - Organization ID support
  - Custom headers
  - Connection test

- **Model Discovery** - Browse 50+ FreeLLM models
  - GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
  - Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
  - Llama 3.1 405B, 70B, 8B
  - Mistral Large, Mistral Nemo, Mixtral 8x7B
  - Gemini 1.5 Pro, Gemini 1.5 Flash
  - Command R+, Command R
  - And more...

- **Docker Support** - Easy deployment
  - Dockerfile with FreeLLM nodes pre-installed
  - docker-compose.yml with n8n + Qdrant
  - Setup scripts for Linux/macOS and Windows
  - Health checks and secure defaults

- **Example Workflows**
  - Basic chat workflow
  - RAG pipeline with vector store
  - Multi-model agent router

- **Documentation**
  - Comprehensive README
  - AGENTS.md for AI assistants
  - CONTRIBUTING.md for developers
  - Setup guides

### Technical Details

- Built with TypeScript 5.3+
- Uses LangChain's ChatOpenAI for compatibility
- Follows n8n node development best practices
- Full TypeScript strict mode
- Vitest for testing
- ESLint for linting

## [Unreleased]

### Planned

- FreeLLM Image Generation node
- FreeLLM Audio Transcription node
- FreeLLM Moderation node
- Batch processing support
- Streaming responses
- Function calling helpers
- Prompt templates library
- Workflow templates marketplace