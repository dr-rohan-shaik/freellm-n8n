#!/bin/bash
# FreeLLM n8n Setup Script (with self-hosted FreeLLMAPI)

set -e

echo "🚀 FreeLLM n8n Setup (Self-Hosted FreeLLMAPI)"
echo "=============================================="
echo ""

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
    echo "✓ $1 found"
}

echo "Checking dependencies..."
check_command "docker"
check_command "docker-compose"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker."
    exit 1
fi
echo "✓ Docker daemon is running"

# Generate encryption keys if not provided
if [ -z "$N8N_ENCRYPTION_KEY" ]; then
    export N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
    echo "Generated N8N_ENCRYPTION_KEY: $N8N_ENCRYPTION_KEY"
fi

if [ -z "$N8N_USER_MANAGEMENT_JWT_SECRET" ]; then
    export N8N_USER_MANAGEMENT_JWT_SECRET=$(openssl rand -hex 32)
    echo "Generated N8N_USER_MANAGEMENT_JWT_SECRET: $N8N_USER_MANAGEMENT_JWT_SECRET"
fi

if [ -z "$FREELLM_ENCRYPTION_KEY" ]; then
    export FREELLM_ENCRYPTION_KEY=$(openssl rand -hex 32)
    echo "Generated FREELLM_ENCRYPTION_KEY: $FREELLM_ENCRYPTION_KEY"
fi

if [ -z "$FREELLM_JWT_SECRET" ]; then
    export FREELLM_JWT_SECRET=$(openssl rand -hex 32)
    echo "Generated FREELLM_JWT_SECRET: $FREELLM_JWT_SECRET"
fi

# Create .env file
cat > .env << EOF
# FreeLLM n8n Configuration (Self-Hosted FreeLLMAPI)
# Generated on $(date)

# n8n Security (CHANGE THESE IN PRODUCTION!)
N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY
N8N_USER_MANAGEMENT_JWT_SECRET=$N8N_USER_MANAGEMENT_JWT_SECRET

# FreeLLMAPI Security (CHANGE THESE IN PRODUCTION!)
FREELLM_ENCRYPTION_KEY=$FREELLM_ENCRYPTION_KEY
FREELLM_JWT_SECRET=$FREELLM_JWT_SECRET

# FreeLLM API (pre-filled for docker-compose)
FREELLM_API_URL=http://localhost:3000/v1
FREELLM_DEFAULT_MODEL=gpt-4o
EOF

echo ""
echo "✓ Created .env file with secure defaults"
echo ""

# Build and start
echo "Building FreeLLM n8n image..."
docker-compose build

echo ""
echo "Starting services (FreeLLMAPI + n8n + Qdrant)..."
docker-compose up -d

echo ""
echo "Waiting for FreeLLMAPI to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:3000/api/ping > /dev/null; then
        echo "✓ FreeLLMAPI is ready!"
        break
    fi
    echo "  Waiting for FreeLLMAPI... ($i/60)"
    sleep 2
done

echo ""
echo "Waiting for n8n to be ready..."
sleep 10

# Check health
for i in {1..30}; do
    if curl -s http://localhost:5678/healthz > /dev/null; then
        echo "✓ n8n is ready!"
        break
    fi
    echo "  Waiting for n8n... ($i/30)"
    sleep 2
done

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "🌐 Access n8n at: http://localhost:5678"
echo "🌐 Access FreeLLMAPI dashboard at: http://localhost:3000"
echo "🌐 Access Qdrant at: http://localhost:6333"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 (FreeLLMAPI dashboard)"
echo "2. Go to Keys page → Add your provider API keys:"
echo "   - Google AI Studio (Gemini) - https://aistudio.google.com/apikey"
echo "   - Groq - https://console.groq.com/keys"
echo "   - Cerebras - https://cloud.cerebras.ai/"
echo "   - OpenRouter - https://openrouter.ai/keys"
echo "   - Requesty - https://requesty.ai/"
echo "   - And 40+ more providers..."
echo "3. Go to Settings → Generate a Unified API Key"
echo "4. Open http://localhost:5678 (n8n)"
echo "5. Create an admin account"
echo "6. Go to Credentials → New Credential → Search 'FreeLLM API (Self-Hosted)'"
echo "7. Enter:"
echo "   - Base URL: http://localhost:3000/v1"
echo "   - API Key: (your FreeLLM unified API key)"
echo "   - Default Model: gpt-4o"
echo "8. Start building workflows with FreeLLM nodes!"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f        # View all logs"
echo "  docker-compose logs freellmapi # View FreeLLMAPI logs"
echo "  docker-compose logs n8n       # View n8n logs"
echo "  docker-compose down           # Stop services"
echo "  docker-compose up -d          # Start services"
echo "  docker-compose restart        # Restart services"