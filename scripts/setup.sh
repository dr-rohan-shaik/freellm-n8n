#!/bin/bash
# FreeLLM n8n Setup Script

set -e

echo "🚀 FreeLLM n8n Setup"
echo "====================="
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

# Generate encryption key if not provided
if [ -z "$N8N_ENCRYPTION_KEY" ]; then
    export N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
    echo "Generated N8N_ENCRYPTION_KEY: $N8N_ENCRYPTION_KEY"
fi

if [ -z "$N8N_USER_MANAGEMENT_JWT_SECRET" ]; then
    export N8N_USER_MANAGEMENT_JWT_SECRET=$(openssl rand -hex 32)
    echo "Generated N8N_USER_MANAGEMENT_JWT_SECRET: $N8N_USER_MANAGEMENT_JWT_SECRET"
fi

# Create .env file
cat > .env << EOF
# FreeLLM n8n Configuration
# Generated on $(date)

# n8n Security (CHANGE THESE IN PRODUCTION!)
N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY
N8N_USER_MANAGEMENT_JWT_SECRET=$N8N_USER_MANAGEMENT_JWT_SECRET

# Database
# POSTGRES_PASSWORD=change-me

# FreeLLM API (optional - can be set in n8n UI)
FREELLM_API_URL=https://api.freellm.com/v1
FREELLM_DEFAULT_MODEL=freellm-gpt-4o
EOF

echo ""
echo "✓ Created .env file with secure defaults"
echo ""

# Build and start
echo "Building FreeLLM n8n image..."
docker-compose build

echo ""
echo "Starting services..."
docker-compose up -d

echo ""
echo "Waiting for n8n to be ready..."
sleep 10

# Check health
for i in {1..30}; do
    if curl -s http://localhost:5678/healthz > /dev/null; then
        echo "✓ n8n is ready!"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 2
done

echo ""
echo "====================="
echo "✅ Setup Complete!"
echo "====================="
echo ""
echo "🌐 Access n8n at: http://localhost:5678"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5678 in your browser"
echo "2. Create an admin account"
echo "3. Go to Credentials → New Credential → Search 'FreeLLM'"
echo "4. Enter your FreeLLM API key (get one at https://freellm.com/api-keys)"
echo "5. Start building workflows with FreeLLM nodes!"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f        # View logs"
echo "  docker-compose down           # Stop services"
echo "  docker-compose up -d          # Start services"
echo "  docker-compose restart        # Restart services"