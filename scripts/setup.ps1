<# 
.SYNOPSIS
    FreeLLM n8n Setup Script for Windows

.DESCRIPTION
    Sets up FreeLLM n8n with Docker Compose on Windows
#>

Write-Host "🚀 FreeLLM n8n Setup" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Check for required tools
function Check-Command {
    param($name)
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Host "❌ $name is not installed. Please install it first." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ $name found" -ForegroundColor Green
}

Write-Host "Checking dependencies..."
Check-Command "docker"
Check-Command "docker-compose"

# Check if Docker daemon is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker daemon is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Generate encryption keys if not provided
if (-not $env:N8N_ENCRYPTION_KEY) {
    $env:N8N_ENCRYPTION_KEY = -join ((1..32) | ForEach-Object { ('{0:X2}' -f (Get-Random -Max 256)) })
    Write-Host "Generated N8N_ENCRYPTION_KEY: $env:N8N_ENCRYPTION_KEY" -ForegroundColor Yellow
}

if (-not $env:N8N_USER_MANAGEMENT_JWT_SECRET) {
    $env:N8N_USER_MANAGEMENT_JWT_SECRET = -join ((1..32) | ForEach-Object { ('{0:X2}' -f (Get-Random -Max 256)) })
    Write-Host "Generated N8N_USER_MANAGEMENT_JWT_SECRET: $env:N8N_USER_MANAGEMENT_JWT_SECRET" -ForegroundColor Yellow
}

# Create .env file
$envContent = @"
# FreeLLM n8n Configuration
# Generated on $(Get-Date)

# n8n Security (CHANGE THESE IN PRODUCTION!)
N8N_ENCRYPTION_KEY=$env:N8N_ENCRYPTION_KEY
N8N_USER_MANAGEMENT_JWT_SECRET=$env:N8N_USER_MANAGEMENT_JWT_SECRET

# Database
# POSTGRES_PASSWORD=change-me

# FreeLLM API (optional - can be set in n8n UI)
FREELLM_API_URL=https://api.freellm.com/v1
FREELLM_DEFAULT_MODEL=freellm-gpt-4o
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8
Write-Host "✓ Created .env file with secure defaults" -ForegroundColor Green
Write-Host ""

# Build and start
Write-Host "Building FreeLLM n8n image..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "Waiting for n8n to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check health
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -Method Get -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ n8n is ready!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "  Waiting... ($i/30)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Access n8n at: http://localhost:5678" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Open http://localhost:5678 in your browser"
Write-Host "2. Create an admin account"
Write-Host "3. Go to Credentials → New Credential → Search 'FreeLLM'"
Write-Host "4. Enter your FreeLLM API key (get one at https://freellm.com/api-keys)"
Write-Host "5. Start building workflows with FreeLLM nodes!"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor White
Write-Host "  docker-compose logs -f        # View logs"
Write-Host "  docker-compose down           # Stop services"
Write-Host "  docker-compose up -d          # Start services"
Write-Host "  docker-compose restart        # Restart services"